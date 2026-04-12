const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  orderReference: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Accepted", "Packed", "Shipped", "Delivered", "Rejected"],
    default: "Pending",
  },
  paymentDetails: {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    method: {
      type: String,
      enum: ["Razorpay", "UPIManual"],
      default: "Razorpay",
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Completed",
        "Failed",
        "Pending Payment",
        "Payment Submitted",
        "Payment Verified",
        "Payment Failed",
        "Payment Expired",
      ],
      default: "Pending",
    },
    sellerUpiId: { type: String },
    sellerName: { type: String },
    expiresAt: { type: Date },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationNote: { type: String },
    lockedAmount: {
      subtotal: { type: Number, default: 0 },
      taxAmount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    proof: {
      screenshotUrl: { type: String },
      claimedTransactionId: { type: String },
    },
  },
  packingProofUrl: { type: String }, // Provided by seller
  trackingId: { type: String },
  courierName: { type: String },
  trackingUrl: { type: String },
  shippedAt: { type: Date },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OrderSchema.pre("validate", function () {
  if (this.status === "Ordered") {
    this.status = "Pending";
  }

  if (this.status === "Cancelled") {
    this.status = "Rejected";
  }
});

module.exports = mongoose.model("Order", OrderSchema);
