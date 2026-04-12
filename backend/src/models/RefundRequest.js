const mongoose = require("mongoose");

const RefundRequestSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  unboxingVideoUrl: { type: String, required: true }, // Mandatory proof
  reason: { type: String, required: true },
  sellerDecision: {
    status: { type: String, enum: ["Accepted", "Rejected"] },
    decidedAt: { type: Date },
  },
  sellerResponse: { type: String },
  sellerRespondedAt: { type: Date },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  adminDecision: {
    reason: String,
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

RefundRequestSchema.index({ orderId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model("RefundRequest", RefundRequestSchema);
