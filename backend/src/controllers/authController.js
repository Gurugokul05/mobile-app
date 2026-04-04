const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
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
      role: role || "buyer",
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

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const { name, email, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    // Email should not be updated via this endpoint for security

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
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
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
