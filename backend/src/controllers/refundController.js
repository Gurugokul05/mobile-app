const RefundRequest = require("../models/RefundRequest");
const Order = require("../models/Order");

const toPublicMediaUrl = (req, value, fileNameHint) => {
  const rawValue = String(value || "");
  const fileName = String(fileNameHint || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop();

  if (!rawValue) return "";
  if (/^https?:\/\//i.test(rawValue)) return rawValue;
  if (!fileName) return rawValue;

  const host = req.get("host");
  const protocol = req.protocol || "http";
  return `${protocol}://${host}/uploads/${fileName}`;
};

// @desc    Create Refund Request (needs unboxing video)
// @route   POST /api/refunds
// @access  Private
exports.createRefundRequest = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only buyers can request refunds" });
    }

    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (!req.file)
      return res
        .status(400)
        .json({ message: "Unboxing video is mandatory for refunds" });

    const refundReq = new RefundRequest({
      orderId,
      buyerId: req.user._id,
      reason,
      unboxingVideoUrl: toPublicMediaUrl(
        req,
        req.file.path || req.file.secure_url,
        req.file.filename || req.file.path,
      ),
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

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can decide refunds" });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be Approved or Rejected" });
    }

    const refundReq = await RefundRequest.findById(req.params.id);
    if (!refundReq)
      return res.status(404).json({ message: "Refund request not found" });

    refundReq.status = status;
    refundReq.adminDecision = {
      reason: adminReason,
      decidedBy: req.user._id,
      decidedAt: new Date(),
    };

    await refundReq.save();
    res.json(refundReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all refund requests (Admin)
// @route   GET /api/refunds
// @access  Private/Admin
exports.getAllRefunds = async (req, res) => {
  try {
    const refunds = await RefundRequest.find()
      .populate("buyerId", "name email")
      .populate("orderId")
      .populate("adminDecision.decidedBy", "name")
      .sort({ createdAt: -1 });

    const normalized = refunds.map((refund) => {
      const item = refund.toObject ? refund.toObject() : { ...refund };
      return {
        ...item,
        unboxingVideoUrl: toPublicMediaUrl(
          req,
          item.unboxingVideoUrl,
          item.unboxingVideoUrl,
        ),
      };
    });

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
