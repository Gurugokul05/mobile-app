const RefundRequest = require('../models/RefundRequest');
const Order = require('../models/Order');

// @desc    Create Refund Request (needs unboxing video)
// @route   POST /api/refunds
// @access  Private
exports.createRefundRequest = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.buyerId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    if (!req.file) return res.status(400).json({ message: 'Unboxing video is mandatory for refunds' });

    const refundReq = new RefundRequest({
      orderId,
      buyerId: req.user._id,
      reason,
      unboxingVideoUrl: req.file.path
    });

    const createdRefundReq = await refundReq.save();
    res.status(201).json(createdRefundReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject Refund (Admin)
// @route   PUT /api/refunds/:id/decide
// @access  Private/Admin
exports.decideRefund = async (req, res) => {
  try {
    const { status, adminReason } = req.body; // 'Approved' or 'Rejected'
    
    const refundReq = await RefundRequest.findById(req.params.id);
    if (!refundReq) return res.status(404).json({ message: 'Refund request not found' });

    refundReq.status = status;
    refundReq.adminDecision = {
      reason: adminReason,
      decidedBy: req.user._id,
      decidedAt: new Date()
    };

    await refundReq.save();
    res.json(refundReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
