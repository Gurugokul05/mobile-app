const mongoose = require('mongoose');

const RefundRequestSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unboxingVideoUrl: { type: String, required: true }, // Mandatory proof
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminDecision: {
    reason: String,
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RefundRequest', RefundRequestSchema);
