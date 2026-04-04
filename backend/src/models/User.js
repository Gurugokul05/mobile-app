const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  savedAddresses: [
    {
      label: { type: String, default: "Home" },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
  ],
  paymentMethods: [
    {
      type: { type: String, enum: ["card", "upi"], default: "upi" },
      label: { type: String, required: true },
      details: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
    },
  ],
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  isVerified: { type: Boolean, default: false }, // For sellers mainly
  verificationDocs: {
    idProofUrl: { type: String },
    locationProofUrl: { type: String },
    makingProofUrl: { type: String },
  },
  trustScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
