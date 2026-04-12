const nodemailer = require("nodemailer");

const SMTP_HOST = String(process.env.SMTP_HOST || "").trim();
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = String(process.env.SMTP_USER || "").trim();
const SMTP_PASS = String(process.env.SMTP_PASS || "")
  .replace(/\s+/g, "")
  .trim();
const RAW_SMTP_FROM = String(process.env.SMTP_FROM || "").trim();
const SMTP_SECURE =
  String(process.env.SMTP_SECURE || "false")
    .trim()
    .toLowerCase() === "true";

const isValidEmailAddress = (value) =>
  /^\S+@\S+\.\S+$/.test(String(value || "").trim());

const resolveSmtpFrom = () => {
  if (RAW_SMTP_FROM.includes("<") && RAW_SMTP_FROM.includes(">")) {
    const address = RAW_SMTP_FROM.slice(
      RAW_SMTP_FROM.lastIndexOf("<") + 1,
      RAW_SMTP_FROM.lastIndexOf(">"),
    ).trim();

    if (isValidEmailAddress(address)) {
      return RAW_SMTP_FROM;
    }
  }

  if (isValidEmailAddress(RAW_SMTP_FROM)) {
    return RAW_SMTP_FROM;
  }

  if (isValidEmailAddress(SMTP_USER)) {
    return SMTP_USER;
  }

  return "";
};

const SMTP_FROM = resolveSmtpFrom();

const isSmtpConfigured = () =>
  Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);

const createTransporter = () =>
  nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

const sendMail = async ({ to, subject, text, html }) => {
  if (!isSmtpConfigured()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in backend .env",
    );
  }

  const transporter = createTransporter();
  return transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = {
  sendMail,
  isSmtpConfigured,
};
