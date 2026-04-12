const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
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
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
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
