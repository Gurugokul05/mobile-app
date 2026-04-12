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
  sellerPayment: {
    upiId: { type: String, default: "" },
    upiIdLastUpdatedAt: { type: Date },
    upiIdChangeLog: [
      {
        previousValue: { type: String, default: "" },
        nextValue: { type: String, default: "" },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
  isVerified: { type: Boolean, default: false }, // For sellers mainly
  verificationDocs: {
    idProofUrl: { type: String },
    locationProofUrl: { type: String },
    makingProofUrl: { type: String },
  },
  trustScore: { type: Number, default: 0 },
  location: { type: String, default: "" },
  description: { type: String, default: "" },
  about: { type: String, default: "" },
  specialties: [{ type: String }],
  certifications: [{ type: String }],
  responseTime: { type: String, default: "" },
  returnRate: { type: String, default: "" },
  yearsInBusiness: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  avatar: { type: String, default: "" },
  storeSettings: {
    bannerUrl: { type: String, default: "" },
    themeColor: { type: String, default: "#007AFF" },
    logoUrl: { type: String, default: "" },
  },
  complianceDocs: {
    gstCertificate: {
      url: { type: String, default: "" },
      status: {
        type: String,
        enum: ["uploaded", "not_verified", "verified", "rejected"],
        default: "not_verified",
      },
      uploadedAt: { type: Date },
      reviewedAt: { type: Date },
      rejectionReason: { type: String, default: "" },
    },
    businessLicense: {
      url: { type: String, default: "" },
      status: {
        type: String,
        enum: ["uploaded", "not_verified", "verified", "rejected"],
        default: "not_verified",
      },
      uploadedAt: { type: Date },
      reviewedAt: { type: Date },
      rejectionReason: { type: String, default: "" },
    },
  },
  twoFactorEnabled: { type: Boolean, default: false },
  lastLoginAt: { type: Date },
  loginActivity: [
    {
      timestamp: { type: Date, default: Date.now },
      ip: { type: String, default: "" },
      userAgent: { type: String, default: "" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
