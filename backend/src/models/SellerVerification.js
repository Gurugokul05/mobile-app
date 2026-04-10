const mongoose = require("mongoose");

const SellerVerificationSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  sellerEmail: {
    type: String,
    required: true,
  },
  sellerPhone: {
    type: String,
  },
  sellerLocation: {
    type: String,
  },
  sellerAddress: {
    type: String,
  },
  documents: {
    idProofUrl: {
      type: String,
      required: true,
    },
    locationProofUrl: {
      type: String,
      required: true,
    },
    makingProofUrl: {
      type: String,
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  adminComments: {
    type: String,
    default: "",
  },
  rejectionReason: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("SellerVerification", SellerVerificationSchema);
