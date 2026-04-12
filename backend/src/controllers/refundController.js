const RefundRequest = require("../models/RefundRequest");
const Order = require("../models/Order");
const { sendMail } = require("../utils/mailer");

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

const buildRefundPayload = (refund, req) => {
  const item = refund.toObject ? refund.toObject() : { ...refund };
  const order = item.orderId || {};
  const packingProofUrl = toPublicMediaUrl(
    req,
    order.packingProofUrl,
    order.packingProofUrl,
  );

  return {
    ...item,
    unboxingVideoUrl: toPublicMediaUrl(
      req,
      item.unboxingVideoUrl,
      item.unboxingVideoUrl,
    ),
    order: {
      _id: order._id,
      status: order.status,
      totalPrice: order.totalPrice,
      quantity: order.quantity,
      shippingAddress: order.shippingAddress,
      packingProofUrl,
      product: order.productId || null,
      seller: order.sellerId || null,
    },
  };
};

const buildOrderRef = (orderId) => String(orderId || "").slice(-6);

const buildSellerRefundEmail = ({
  sellerName,
  buyerName,
  reason,
  orderId,
  productName,
  orderTotal,
  quantity,
}) => {
  const orderRef = buildOrderRef(orderId);
  const subject = `New refund request submitted - Order #${orderRef}`;
  const text = [
    `Hello ${sellerName || "Seller"},`,
    "",
    `A refund request has been submitted for order #${orderRef}.`,
    `Buyer: ${buyerName || "Unknown"}`,
    `Product: ${productName || "N/A"}`,
    `Quantity: ${quantity ?? "N/A"}`,
    `Order total: ${orderTotal ?? "N/A"}`,
    `Reason: ${reason || "N/A"}`,
    "",
    "Please review the refund evidence in the seller app.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;background:#f8fafc;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="padding:18px 24px;background:#0f172a;color:#ffffff">
          <div style="font-size:20px;font-weight:800">Refund Request Submitted</div>
          <div style="margin-top:4px;font-size:13px;opacity:0.85">Please review this dispute in the seller app</div>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 12px">Hello ${sellerName || "Seller"},</p>
          <p style="margin:0 0 16px">A refund request has been submitted for order <strong>#${orderRef}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 18px;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#64748b;width:38%">Buyer</td>
              <td style="padding:8px 0;font-weight:600">${buyerName || "Unknown"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b">Product</td>
              <td style="padding:8px 0;font-weight:600">${productName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b">Quantity</td>
              <td style="padding:8px 0;font-weight:600">${quantity ?? "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b">Order total</td>
              <td style="padding:8px 0;font-weight:600">${orderTotal ?? "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;vertical-align:top">Reason</td>
              <td style="padding:8px 0;font-weight:600">${reason || "N/A"}</td>
            </tr>
          </table>
          <p style="margin:0;color:#475569">Please review the refund evidence in the seller app.</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const buildBuyerRefundEmail = ({
  buyerName,
  sellerName,
  status,
  reason,
  orderId,
  productName,
  orderTotal,
  quantity,
}) => {
  const orderRef = buildOrderRef(orderId);
  const normalizedStatus = String(status || "updated");
  const subject = `Your refund request was ${normalizedStatus.toLowerCase()} - Order #${orderRef}`;
  const text = [
    `Hello ${buyerName || "Buyer"},`,
    "",
    `Your refund request for order #${orderRef} was ${normalizedStatus}.`,
    `Seller: ${sellerName || "N/A"}`,
    `Product: ${productName || "N/A"}`,
    `Quantity: ${quantity ?? "N/A"}`,
    `Order total: ${orderTotal ?? "N/A"}`,
    reason ? `Reason: ${reason}` : null,
    "",
    "Please check the app for the latest refund status.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.6;background:#f8fafc;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
        <div style="padding:18px 24px;background:${normalizedStatus === "Approved" ? "#166534" : "#991b1b"};color:#ffffff">
          <div style="font-size:20px;font-weight:800">Refund ${normalizedStatus}</div>
          <div style="margin-top:4px;font-size:13px;opacity:0.85">Order #${orderRef}</div>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 12px">Hello ${buyerName || "Buyer"},</p>
          <p style="margin:0 0 16px">Your refund request for order <strong>#${orderRef}</strong> was <strong>${normalizedStatus}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;margin:0 0 18px;font-size:14px">
            <tr>
              <td style="padding:8px 0;color:#64748b;width:38%">Seller</td>
              <td style="padding:8px 0;font-weight:600">${sellerName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;width:38%">Product</td>
              <td style="padding:8px 0;font-weight:600">${productName || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b">Quantity</td>
              <td style="padding:8px 0;font-weight:600">${quantity ?? "N/A"}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b">Order total</td>
              <td style="padding:8px 0;font-weight:600">${orderTotal ?? "N/A"}</td>
            </tr>
            ${reason ? `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top">Admin note</td><td style="padding:8px 0;font-weight:600">${reason}</td></tr>` : ""}
          </table>
          <p style="margin:0;color:#475569">Please check the app for the latest refund status.</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

const trySendMail = async (payload, contextLabel) => {
  try {
    await sendMail(payload);
  } catch (error) {
    console.error(
      `[refund-mail] ${contextLabel} email failed:`,
      error?.message || error,
    );
  }
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

    const order = await Order.findById(orderId)
      .populate("sellerId", "name email")
      .populate("buyerId", "name email")
      .populate("productId", "name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (String(order.buyerId?._id || order.buyerId) !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const existingRefund = await RefundRequest.findOne({
      orderId,
      buyerId: req.user._id,
    }).select("_id status");

    if (existingRefund) {
      return res.status(400).json({
        message: "Refund request already exists for this order",
      });
    }

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

    const sellerEmail = String(order?.sellerId?.email || "").trim();
    if (sellerEmail) {
      const sellerName = String(order?.sellerId?.name || "Seller").trim();
      const buyerName = String(
        req.user?.name || order?.buyerId?.name || "Buyer",
      ).trim();
      const notification = buildSellerRefundEmail({
        sellerName,
        buyerName,
        reason: String(reason || "").trim(),
        orderId: order._id,
        productName: String(order?.productId?.name || "N/A").trim(),
        orderTotal: order?.totalPrice ?? "N/A",
        quantity: order?.quantity ?? "N/A",
      });

      await trySendMail(
        {
          to: sellerEmail,
          ...notification,
        },
        "seller-notification",
      );
    }

    res.status(201).json(createdRefundReq);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        message: "Refund request already exists for this order",
      });
    }
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

    if (refundReq.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending refunds can be decided",
      });
    }

    refundReq.status = status;
    refundReq.adminDecision = {
      reason: adminReason || "",
      decidedBy: req.user._id,
      decidedAt: new Date(),
    };

    await refundReq.save();

    const populatedRefund = await RefundRequest.findById(refundReq._id)
      .populate("buyerId", "name email")
      .populate({
        path: "orderId",
        populate: [
          { path: "productId", select: "name price images originPlace" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .populate("adminDecision.decidedBy", "name");

    const buyerEmail = String(populatedRefund?.buyerId?.email || "").trim();
    if (buyerEmail) {
      const buyerName = String(
        populatedRefund?.buyerId?.name || "Buyer",
      ).trim();
      const orderId = populatedRefund?.orderId?._id || populatedRefund?.orderId;
      const populatedOrder = populatedRefund?.orderId || {};
      const notification = buildBuyerRefundEmail({
        buyerName,
        sellerName: String(
          populatedOrder?.sellerId?.name ||
            populatedOrder?.seller?.name ||
            "N/A",
        ).trim(),
        status,
        reason: String(adminReason || "").trim(),
        orderId,
        productName: String(
          populatedOrder?.productId?.name ||
            populatedOrder?.product?.name ||
            "N/A",
        ).trim(),
        orderTotal: populatedOrder?.totalPrice ?? "N/A",
        quantity: populatedOrder?.quantity ?? "N/A",
      });

      await trySendMail(
        {
          to: buyerEmail,
          ...notification,
        },
        "buyer-notification",
      );
    }

    res.json(populatedRefund);
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
      .populate({
        path: "orderId",
        populate: [
          { path: "productId", select: "name price images originPlace" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .populate("adminDecision.decidedBy", "name")
      .sort({ createdAt: -1 });

    const normalized = refunds.map((refund) => buildRefundPayload(refund, req));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current buyer refund requests
// @route   GET /api/refunds/my
// @access  Private/Buyer
exports.getMyRefunds = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only buyers can view their refunds" });
    }

    const refunds = await RefundRequest.find({ buyerId: req.user._id })
      .populate({
        path: "orderId",
        populate: [
          { path: "productId", select: "name price images originPlace" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.json(refunds.map((refund) => buildRefundPayload(refund, req)));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller refund requests
// @route   GET /api/refunds/seller
// @access  Private/Seller
exports.getSellerRefunds = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can view seller refund requests" });
    }

    const sellerOrders = await Order.find({ sellerId: req.user._id }).select(
      "_id",
    );
    const sellerOrderIds = sellerOrders.map((order) => order._id);

    const refunds = await RefundRequest.find({
      orderId: { $in: sellerOrderIds },
    })
      .populate("buyerId", "name email")
      .populate({
        path: "orderId",
        populate: [
          { path: "productId", select: "name price images originPlace" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.json(refunds.map((refund) => buildRefundPayload(refund, req)));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Seller response on refund request
// @route   PUT /api/refunds/:id/respond
// @access  Private/Seller
exports.respondRefund = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can respond to refund disputes" });
    }

    const refundReq = await RefundRequest.findById(req.params.id).populate({
      path: "orderId",
      select: "sellerId",
    });

    if (!refundReq) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    if (!refundReq.orderId) {
      return res.status(404).json({ message: "Order not found for refund" });
    }

    if (refundReq.orderId.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (refundReq.status !== "Pending") {
      return res
        .status(400)
        .json({ message: "Cannot respond after refund is decided" });
    }

    refundReq.sellerResponse = req.body.sellerResponse;
    refundReq.sellerRespondedAt = new Date();
    await refundReq.save();

    const updatedRefund = await RefundRequest.findById(refundReq._id)
      .populate("buyerId", "name email")
      .populate({
        path: "orderId",
        populate: [
          { path: "productId", select: "name price images originPlace" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .populate("adminDecision.decidedBy", "name");

    return res.json(buildRefundPayload(updatedRefund, req));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Seller accept/reject refund request
// @route   PUT /api/refunds/:id/seller-decision
// @access  Private/Seller
exports.decideRefundAsSeller = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can decide seller-side refund status" });
    }

    const refundReq = await RefundRequest.findById(req.params.id).populate({
      path: "orderId",
      select: "sellerId",
    });

    if (!refundReq) {
      return res.status(404).json({ message: "Refund request not found" });
    }

    if (!refundReq.orderId) {
      return res.status(404).json({ message: "Order not found for refund" });
    }

    if (refundReq.orderId.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (refundReq.status !== "Pending") {
      return res.status(400).json({
        message:
          "Cannot change seller decision after refund is decided by admin",
      });
    }

    refundReq.sellerDecision = {
      status: req.body.status,
      decidedAt: new Date(),
    };

    if (
      typeof req.body.sellerResponse === "string" &&
      req.body.sellerResponse.trim()
    ) {
      refundReq.sellerResponse = req.body.sellerResponse.trim();
      refundReq.sellerRespondedAt = new Date();
    }

    await refundReq.save();

    const updatedRefund = await RefundRequest.findById(refundReq._id)
      .populate("buyerId", "name email")
      .populate({
        path: "orderId",
        populate: [
          { path: "productId", select: "name price images originPlace" },
          { path: "sellerId", select: "name email" },
        ],
      })
      .populate("adminDecision.decidedBy", "name");

    return res.json(buildRefundPayload(updatedRefund, req));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
