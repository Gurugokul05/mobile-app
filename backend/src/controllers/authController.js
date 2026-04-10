const User = require("../models/User");
const OtpChallenge = require("../models/OtpChallenge");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const forgotPasswordOtpStore = new Map();
const loginTwoFactorStore = new Map();
const deleteAccountOtpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_COOLDOWN_MS = 30 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const MAX_LOGIN_ACTIVITY = 20;

const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = String(process.env.SMTP_USER || "").trim();
const SMTP_PASS = String(process.env.SMTP_PASS || "").trim();
const SMTP_FROM = String(process.env.SMTP_FROM || SMTP_USER || "").trim();
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

const isSmtpConfigured = () =>
  Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);

const createSmtpTransporter = () =>
  nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

const buildOtpEmailTemplate = ({ heading, intro, otp, footerNote }) => {
  return `
    <div style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;color:#0f172a;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:18px 22px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);color:#ffffff;">
                  <div style="font-size:20px;font-weight:800;letter-spacing:0.3px;">Roots</div>
                  <div style="margin-top:4px;font-size:12px;opacity:0.9;">Secure Account Verification</div>
                </td>
              </tr>
              <tr>
                <td style="padding:22px;">
                  <h2 style="margin:0 0 10px;font-size:22px;line-height:1.3;color:#0f172a;">${heading}</h2>
                  <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.7;">${intro}</p>

                  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px;text-align:center;margin:12px 0 16px;">
                    <div style="font-size:12px;color:#1e3a8a;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;margin-bottom:8px;">One-Time Password</div>
                    <div style="font-size:34px;letter-spacing:6px;font-weight:800;color:#1d4ed8;line-height:1;">${otp}</div>
                  </div>

                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">
                    This code will expire in 5 minutes and can only be used once.
                  </p>
                  <p style="margin:12px 0 0;font-size:13px;color:#475569;line-height:1.7;">
                    ${footerNote}
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:14px 22px;border-top:1px solid #e2e8f0;background:#f8fafc;font-size:12px;color:#64748b;line-height:1.7;">
                  For security reasons, never share this OTP with anyone. Roots support will never ask for it.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

const sendOtpEmail = async ({ to, otp, purpose }) => {
  if (!isSmtpConfigured()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in backend .env",
    );
  }

  const isForgot = purpose === "forgot-password";
  const isLogin2fa = purpose === "login-2fa";
  const isDeleteAccount = purpose === "delete-account";
  const subject = isForgot
    ? "Roots Password Reset OTP"
    : isLogin2fa
      ? "Roots Login Verification OTP"
      : isDeleteAccount
        ? "Roots Account Deletion OTP"
        : "Roots Registration OTP";
  const heading = isForgot
    ? "Reset Your Password"
    : isLogin2fa
      ? "Verify Your Login"
      : isDeleteAccount
        ? "Confirm Account Deletion"
        : "Verify Your Email";
  const intro = isForgot
    ? "We received a request to reset your Roots account password. Use the OTP below to continue."
    : isLogin2fa
      ? "A login attempt requires your two-factor verification. Use the OTP below to continue signing in."
      : isDeleteAccount
        ? "We received a request to permanently delete your Roots account. Use the OTP below to continue."
        : "Thank you for signing up with Roots. Use the OTP below to verify your email and complete registration.";
  const footerNote = isForgot
    ? "If you did not request this, please ignore this email and keep your account secure."
    : isLogin2fa
      ? "If this was not you, change your account password immediately."
      : isDeleteAccount
        ? "If you did not request account deletion, ignore this email and your account will remain active."
        : "If you did not initiate this registration, you can safely ignore this email.";

  const transporter = createSmtpTransporter();
  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text: `Your Roots OTP is ${otp}. It expires in 5 minutes.`,
    html: buildOtpEmailTemplate({ heading, intro, otp, footerNote }),
  });
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const maskEmail = (email) => {
  const normalized = String(email || "")
    .trim()
    .toLowerCase();
  const [localPart, domain] = normalized.split("@");
  if (!localPart || !domain) return "";
  const start = localPart.slice(0, 1);
  const end = localPart.slice(-1);
  const middle = "*".repeat(Math.max(localPart.length - 2, 1));
  return `${start}${middle}${end}@${domain}`;
};

const buildAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  token: generateToken(user._id),
});

const recordLoginSuccess = async (user, req) => {
  const loginEntry = {
    timestamp: new Date(),
    ip: String(req.ip || "").trim(),
    userAgent: String(req.headers["user-agent"] || "").trim(),
  };

  user.lastLoginAt = loginEntry.timestamp;
  user.loginActivity = [loginEntry, ...(user.loginActivity || [])].slice(
    0,
    MAX_LOGIN_ACTIVITY,
  );

  await user.save();
};

const createTwoFactorSession = async ({ user, req }) => {
  const sessionId = crypto.randomBytes(24).toString("hex");
  const otp = generateOtp();
  const now = Date.now();

  await sendOtpEmail({
    to: user.email,
    otp,
    purpose: "login-2fa",
  });

  loginTwoFactorStore.set(sessionId, {
    userId: String(user._id),
    email: String(user.email || "")
      .trim()
      .toLowerCase(),
    otp,
    expiresAt: now + OTP_EXPIRY_MS,
    lastSentAt: now,
    attempts: 0,
    ip: String(req.ip || "").trim(),
    userAgent: String(req.headers["user-agent"] || "").trim(),
  });

  return {
    twoFactorSessionId: sessionId,
    expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
  };
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedName = String(name || "").trim();

  try {
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: ["buyer", "seller"].includes(role) ? role : "buyer",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendRegisterOtp = async (req, res) => {
  const normalizedEmail = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const now = Date.now();
    const existing = await OtpChallenge.findOne({
      purpose: "register",
      email: normalizedEmail,
    });

    if (
      existing &&
      now - new Date(existing.lastSentAt).getTime() < OTP_COOLDOWN_MS
    ) {
      const retryAfterSeconds = Math.ceil(
        (OTP_COOLDOWN_MS - (now - new Date(existing.lastSentAt).getTime())) /
          1000,
      );
      return res.status(429).json({
        message: `Please wait ${retryAfterSeconds}s before requesting a new OTP`,
        retryAfter: retryAfterSeconds,
      });
    }

    const otp = generateOtp();

    await sendOtpEmail({ to: normalizedEmail, otp, purpose: "register" });

    await OtpChallenge.findOneAndUpdate(
      {
        purpose: "register",
        email: normalizedEmail,
      },
      {
        $set: {
          otp,
          expiresAt: new Date(now + OTP_EXPIRY_MS),
          lastSentAt: new Date(now),
          attempts: 0,
        },
      },
      { upsert: true },
    );

    console.log(`[REGISTER OTP SENT] ${normalizedEmail}`);

    const response = {
      message: "OTP sent successfully",
      expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.sendForgotPasswordOtp = async (req, res) => {
  const normalizedEmail = String(req.body?.email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await User.findOne({
      email: { $regex: `^${escapedEmail}$`, $options: "i" },
    });

    // Return generic success even when no account exists to avoid false negatives
    // caused by minor email variations and to prevent account enumeration.
    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists for this email, a password reset OTP has been sent",
        expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
      });
    }

    const now = Date.now();
    const existing = forgotPasswordOtpStore.get(normalizedEmail);
    if (existing && now - existing.lastSentAt < OTP_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (OTP_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000,
      );
      return res.status(429).json({
        message: `Please wait ${retryAfterSeconds}s before requesting a new OTP`,
        retryAfter: retryAfterSeconds,
      });
    }

    const otp = generateOtp();
    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose: "forgot-password",
    });

    forgotPasswordOtpStore.set(normalizedEmail, {
      otp,
      expiresAt: now + OTP_EXPIRY_MS,
      lastSentAt: now,
      attempts: 0,
    });

    console.log(`[FORGOT PASSWORD OTP SENT] ${normalizedEmail}`);

    return res.status(200).json({
      message: "Password reset OTP sent successfully",
      expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  const normalizedEmail = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const normalizedOtp = String(req.body?.otp || "").trim();
  const newPassword = String(req.body?.newPassword || "");

  if (!normalizedEmail || !normalizedOtp || !newPassword) {
    return res.status(400).json({
      message: "email, otp and newPassword are required",
    });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found with this email" });
    }

    const otpEntry = forgotPasswordOtpStore.get(normalizedEmail);
    if (!otpEntry) {
      return res.status(400).json({ message: "Please request OTP first" });
    }

    if (Date.now() > otpEntry.expiresAt) {
      forgotPasswordOtpStore.delete(normalizedEmail);
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new OTP" });
    }

    if (otpEntry.attempts >= OTP_MAX_ATTEMPTS) {
      forgotPasswordOtpStore.delete(normalizedEmail);
      return res.status(429).json({
        message: "Too many invalid attempts. Request a new OTP",
      });
    }

    if (otpEntry.otp !== normalizedOtp) {
      otpEntry.attempts += 1;
      forgotPasswordOtpStore.set(normalizedEmail, otpEntry);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    forgotPasswordOtpStore.delete(normalizedEmail);

    return res.status(200).json({
      message: "Password reset successful. Please login with your new password",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.registerWithOtp = async (req, res) => {
  const { name, email, password, role, otp } = req.body || {};
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const normalizedName = String(name || "").trim();
  const normalizedOtp = String(otp || "").trim();

  if (!normalizedName || !normalizedEmail || !password || !normalizedOtp) {
    return res.status(400).json({
      message: "name, email, password and otp are required",
    });
  }

  try {
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otpEntry = await OtpChallenge.findOne({
      purpose: "register",
      email: normalizedEmail,
    });

    if (!otpEntry) {
      return res.status(400).json({ message: "Please request OTP first" });
    }

    if (Date.now() > new Date(otpEntry.expiresAt).getTime()) {
      await OtpChallenge.deleteOne({ _id: otpEntry._id });
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new OTP" });
    }

    if (otpEntry.attempts >= OTP_MAX_ATTEMPTS) {
      await OtpChallenge.deleteOne({ _id: otpEntry._id });
      return res.status(429).json({
        message: "Too many invalid attempts. Request a new OTP",
      });
    }

    if (otpEntry.otp !== normalizedOtp) {
      otpEntry.attempts += 1;
      await otpEntry.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: ["buyer", "seller"].includes(role) ? role : "buyer",
    });

    await OtpChallenge.deleteOne({ _id: otpEntry._id });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.twoFactorEnabled) {
        const challenge = await createTwoFactorSession({ user, req });
        return res.status(202).json({
          requiresTwoFactor: true,
          twoFactorSessionId: challenge.twoFactorSessionId,
          emailMasked: maskEmail(user.email),
          expiresIn: challenge.expiresIn,
          message: "OTP sent to your email for login verification",
        });
      }

      await recordLoginSuccess(user, req);
      return res.json(buildAuthResponse(user));
    } else {
      return res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyLoginTwoFactorOtp = async (req, res) => {
  const sessionId = String(req.body?.twoFactorSessionId || "").trim();
  const otp = String(req.body?.otp || "").trim();

  try {
    const session = loginTwoFactorStore.get(sessionId);
    if (!session) {
      return res
        .status(400)
        .json({ message: "Invalid or expired 2FA session" });
    }

    if (Date.now() > session.expiresAt) {
      loginTwoFactorStore.delete(sessionId);
      return res
        .status(400)
        .json({ message: "OTP expired. Please login again" });
    }

    if (session.attempts >= OTP_MAX_ATTEMPTS) {
      loginTwoFactorStore.delete(sessionId);
      return res.status(429).json({
        message: "Too many invalid attempts. Please login again",
      });
    }

    if (session.otp !== otp) {
      session.attempts += 1;
      loginTwoFactorStore.set(sessionId, session);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findById(session.userId);
    if (!user) {
      loginTwoFactorStore.delete(sessionId);
      return res.status(404).json({ message: "User not found" });
    }

    await recordLoginSuccess(user, req);
    loginTwoFactorStore.delete(sessionId);

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.resendLoginTwoFactorOtp = async (req, res) => {
  const sessionId = String(req.body?.twoFactorSessionId || "").trim();

  try {
    const session = loginTwoFactorStore.get(sessionId);
    if (!session) {
      return res
        .status(400)
        .json({ message: "Invalid or expired 2FA session" });
    }

    if (Date.now() > session.expiresAt) {
      loginTwoFactorStore.delete(sessionId);
      return res
        .status(400)
        .json({ message: "OTP session expired. Please login again" });
    }

    const now = Date.now();
    if (now - session.lastSentAt < OTP_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (OTP_COOLDOWN_MS - (now - session.lastSentAt)) / 1000,
      );

      return res.status(429).json({
        message: `Please wait ${retryAfterSeconds}s before requesting a new OTP`,
        retryAfter: retryAfterSeconds,
      });
    }

    const otp = generateOtp();
    await sendOtpEmail({
      to: session.email,
      otp,
      purpose: "login-2fa",
    });

    session.otp = otp;
    session.lastSentAt = now;
    session.expiresAt = now + OTP_EXPIRY_MS;
    session.attempts = 0;
    loginTwoFactorStore.set(sessionId, session);

    return res.status(200).json({
      message: "OTP resent successfully",
      expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      location,
      description,
      about,
      specialties,
      certifications,
      responseTime,
      returnRate,
      yearsInBusiness,
      totalOrders,
      totalReviews,
      averageRating,
      avatar,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedName = String(name ?? user.name ?? "").trim();
    const normalizedPhone = String(phone ?? user.phone ?? "").trim();
    const normalizedAddress = String(address ?? user.address ?? "").trim();
    const normalizedLocation = String(location ?? user.location ?? "").trim();
    const normalizedResponseTime = String(
      responseTime ?? user.responseTime ?? "",
    ).trim();
    const normalizedReturnRate = String(
      returnRate ?? user.returnRate ?? "",
    ).trim();
    const normalizedDescription = String(
      description ?? user.description ?? "",
    ).trim();
    const normalizedAbout = String(about ?? user.about ?? "").trim();
    const normalizedYearsInBusiness = Number(
      yearsInBusiness ?? user.yearsInBusiness ?? 0,
    );

    const normalizedSpecialties = Array.isArray(specialties)
      ? specialties.map((item) => String(item || "").trim()).filter(Boolean)
      : Array.isArray(user.specialties)
        ? user.specialties
        : [];

    const normalizedCertifications = Array.isArray(certifications)
      ? certifications.map((item) => String(item || "").trim()).filter(Boolean)
      : Array.isArray(user.certifications)
        ? user.certifications
        : [];

    if (req.user.role === "seller") {
      const missingFields = [];
      if (!normalizedName) missingFields.push("name");
      if (!normalizedPhone) missingFields.push("phone");
      if (!normalizedAddress) missingFields.push("address");
      if (!normalizedResponseTime) missingFields.push("responseTime");
      if (!normalizedDescription) missingFields.push("description");

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Please complete required seller profile fields: ${missingFields.join(", ")}`,
          missingFields,
        });
      }
    }

    // Update allowed fields
    if (normalizedName) user.name = normalizedName;
    if (normalizedPhone) user.phone = normalizedPhone;
    if (normalizedAddress) user.address = normalizedAddress;
    if (typeof location === "string") user.location = normalizedLocation;
    if (typeof description === "string")
      user.description = normalizedDescription;
    if (typeof about === "string") user.about = normalizedAbout;
    if (typeof responseTime === "string") {
      user.responseTime = normalizedResponseTime;
    }
    if (typeof returnRate === "string") user.returnRate = normalizedReturnRate;
    if (typeof avatar === "string") user.avatar = avatar.trim();

    if (Array.isArray(specialties)) {
      user.specialties = normalizedSpecialties;
    }

    if (Array.isArray(certifications)) {
      user.certifications = normalizedCertifications;
    }

    if (Number.isFinite(Number(yearsInBusiness))) {
      user.yearsInBusiness = Math.max(0, normalizedYearsInBusiness);
    }

    if (req.user.role === "seller") {
      if (Number.isFinite(Number(totalOrders))) {
        user.totalOrders = Math.max(0, Number(totalOrders));
      }
      if (Number.isFinite(Number(totalReviews))) {
        user.totalReviews = Math.max(0, Number(totalReviews));
      }
      if (Number.isFinite(Number(averageRating))) {
        user.averageRating = Math.max(0, Math.min(5, Number(averageRating)));
      }
    }
    // Email should not be updated via this endpoint for security

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      location: user.location,
      description: user.description,
      about: user.about,
      specialties: user.specialties || [],
      certifications: user.certifications || [],
      responseTime: user.responseTime,
      returnRate: user.returnRate,
      yearsInBusiness: user.yearsInBusiness || 0,
      totalOrders: user.totalOrders || 0,
      totalReviews: user.totalReviews || 0,
      averageRating: user.averageRating || 0,
      avatar: user.avatar,
      trustScore: user.trustScore || 0,
      isVerified: !!user.isVerified,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSavedAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("savedAddresses");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.savedAddresses || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSavedAddress = async (req, res) => {
  try {
    const { label, street, city, state, pincode, isDefault } = req.body;

    if (!street || !city || !state || !pincode) {
      return res
        .status(400)
        .json({ message: "street, city, state and pincode are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isDefault) {
      user.savedAddresses = (user.savedAddresses || []).map((addr) => ({
        ...addr.toObject(),
        isDefault: false,
      }));
    }

    user.savedAddresses.push({
      label: label || "Home",
      street,
      city,
      state,
      pincode,
      isDefault: !!isDefault,
    });

    await user.save();
    res.status(201).json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteSavedAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.savedAddresses.length;
    user.savedAddresses = user.savedAddresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId,
    );

    if (before === user.savedAddresses.length) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (
      user.savedAddresses.length > 0 &&
      !user.savedAddresses.some((addr) => addr.isDefault)
    ) {
      user.savedAddresses[0].isDefault = true;
    }

    await user.save();
    res.json(user.savedAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("paymentMethods");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.paymentMethods || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addPaymentMethod = async (req, res) => {
  try {
    const { type, label, details, isDefault } = req.body;

    if (!label || !details) {
      return res
        .status(400)
        .json({ message: "label and details are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isDefault) {
      user.paymentMethods = (user.paymentMethods || []).map((method) => ({
        ...method.toObject(),
        isDefault: false,
      }));
    }

    user.paymentMethods.push({
      type: type || "upi",
      label,
      details,
      isDefault: !!isDefault,
    });

    await user.save();
    res.status(201).json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePaymentMethod = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.paymentMethods.length;
    user.paymentMethods = user.paymentMethods.filter(
      (method) => method._id.toString() !== req.params.methodId,
    );

    if (before === user.paymentMethods.length) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    if (
      user.paymentMethods.length > 0 &&
      !user.paymentMethods.some((method) => method.isDefault)
    ) {
      user.paymentMethods[0].isDefault = true;
    }

    await user.save();
    res.json(user.paymentMethods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMyAccount = async (req, res) => {
  return res.status(400).json({
    message:
      "Direct account deletion is disabled. Request OTP via /api/auth/me/delete/send-otp and confirm via /api/auth/me/delete/confirm",
  });
};

exports.sendDeleteAccountOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = String(user._id);
    const normalizedEmail = String(user.email || "")
      .trim()
      .toLowerCase();
    const now = Date.now();
    const existing = deleteAccountOtpStore.get(userId);

    if (existing && now - existing.lastSentAt < OTP_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil(
        (OTP_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000,
      );

      return res.status(429).json({
        message: `Please wait ${retryAfterSeconds}s before requesting a new OTP`,
        retryAfter: retryAfterSeconds,
      });
    }

    const otp = generateOtp();
    await sendOtpEmail({
      to: normalizedEmail,
      otp,
      purpose: "delete-account",
    });

    deleteAccountOtpStore.set(userId, {
      otp,
      expiresAt: now + OTP_EXPIRY_MS,
      lastSentAt: now,
      attempts: 0,
      email: normalizedEmail,
    });

    return res.status(200).json({
      message: "Account deletion OTP sent successfully",
      expiresIn: Math.floor(OTP_EXPIRY_MS / 1000),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.confirmDeleteMyAccount = async (req, res) => {
  const normalizedOtp = String(req.body?.otp || "").trim();

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = String(user._id);
    const otpEntry = deleteAccountOtpStore.get(userId);
    if (!otpEntry) {
      return res.status(400).json({
        message: "Please request account deletion OTP first",
      });
    }

    if (Date.now() > otpEntry.expiresAt) {
      deleteAccountOtpStore.delete(userId);
      return res
        .status(400)
        .json({ message: "OTP expired. Request a new OTP" });
    }

    if (otpEntry.attempts >= OTP_MAX_ATTEMPTS) {
      deleteAccountOtpStore.delete(userId);
      return res.status(429).json({
        message: "Too many invalid attempts. Request a new OTP",
      });
    }

    if (otpEntry.otp !== normalizedOtp) {
      otpEntry.attempts += 1;
      deleteAccountOtpStore.set(userId, otpEntry);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    deleteAccountOtpStore.delete(userId);
    await User.findByIdAndDelete(userId);

    return res.json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
