const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const { toStoredUploadUrl } = require("../utils/media");

let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "test_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
  });
} catch (err) {
  console.log("Razorpay keys missing or invalid, mockup mode available.");
}

const normalizeOrderStatus = (status) => {
  if (status === "Ordered") return "Pending";
  if (status === "Cancelled") return "Rejected";
  return status;
};

const PAYMENT_PENDING = "Pending Payment";
const PAYMENT_SUBMITTED = "Payment Submitted";
const PAYMENT_VERIFIED = "Payment Verified";
const PAYMENT_FAILED = "Payment Failed";
const PAYMENT_EXPIRED = "Payment Expired";

const UPI_PAYMENT_TIMEOUT_MINUTES = Number(
  process.env.UPI_PAYMENT_TIMEOUT_MINUTES || 15,
);
const TAX_RATE = Number(process.env.UPI_TAX_RATE || 0.05);
const DELIVERY_FEE = Number(process.env.UPI_DELIVERY_FEE || 0);

const toAmount = (value) => Number(Number(value || 0).toFixed(2));

const generateOrderReference = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const randomPart = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${yyyy}${mm}${dd}-${randomPart}`;
};

const markPaymentExpiredIfNeeded = async (order) => {
  const isPendingPayment = order?.paymentDetails?.status === PAYMENT_PENDING;
  const expiryAt = order?.paymentDetails?.expiresAt;

  if (!isPendingPayment || !expiryAt) {
    return order;
  }

  if (new Date(expiryAt).getTime() > Date.now()) {
    return order;
  }

  order.paymentDetails.status = PAYMENT_EXPIRED;
  order.paymentDetails.verificationNote =
    "Payment window expired before proof submission";
  order.updatedAt = new Date();
  await order.save();
  return order;
};

// @desc    Create new order for UPI manual payment flow
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    if (req.user.role !== "buyer") {
      return res.status(403).json({ message: "Only buyers can create orders" });
    }

    const { productId, quantity, shippingAddress } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const seller = await User.findById(product.sellerId).select(
      "name sellerPayment role",
    );
    const sellerUpiId = String(seller?.sellerPayment?.upiId || "").trim();
    if (!sellerUpiId) {
      return res.status(400).json({
        message:
          "Seller UPI ID is missing. This seller cannot receive UPI payments right now.",
      });
    }

    const subtotal = toAmount(product.price * quantity);
    const taxAmount = toAmount(subtotal * TAX_RATE);
    const deliveryFee = toAmount(DELIVERY_FEE);
    const totalPrice = toAmount(subtotal + taxAmount + deliveryFee);

    let orderReference = generateOrderReference();
    while (await Order.exists({ orderReference })) {
      orderReference = generateOrderReference();
    }

    const expiresAt = new Date(
      Date.now() + UPI_PAYMENT_TIMEOUT_MINUTES * 60 * 1000,
    );

    const order = new Order({
      orderReference,
      buyerId: req.user._id,
      sellerId: product.sellerId,
      productId,
      quantity,
      totalPrice,
      status: "Pending",
      paymentDetails: {
        method: "UPIManual",
        status: PAYMENT_PENDING,
        sellerUpiId,
        sellerName: seller?.name || "Seller",
        expiresAt,
        lockedAmount: {
          subtotal,
          taxAmount,
          deliveryFee,
          grandTotal: totalPrice,
          currency: "INR",
        },
      },
      shippingAddress,
    });

    const createdOrder = await order.save();
    res.status(201).json({
      order: createdOrder,
      paymentMode: "upi_manual",
      paymentSession: {
        sellerName: seller?.name || "Seller",
        sellerUpiId,
        amount: totalPrice,
        currency: "INR",
        orderReference,
        expiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Razorpay configuration status
// @route   GET /api/orders/razorpay/diagnostics
// @access  Public
exports.getRazorpayDiagnostics = async (req, res) => {
  const isTestMode =
    String(process.env.RAZORPAY_TEST_MODE || "false")
      .trim()
      .toLowerCase() === "true";
  const hasKeys =
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET);
  const isConfigured = hasKeys && razorpayInstance;

  res.json({
    razorpayConfigured: isConfigured,
    testMode: isTestMode,
    hasKeyId: Boolean(process.env.RAZORPAY_KEY_ID),
    hasKeySecret: Boolean(process.env.RAZORPAY_KEY_SECRET),
    keyIdMasked: process.env.RAZORPAY_KEY_ID
      ? `${String(process.env.RAZORPAY_KEY_ID).slice(0, 8)}***`
      : null,
    message: isConfigured
      ? "Razorpay is configured and ready for payments"
      : isTestMode
        ? "Test mode enabled - payments will be processed in mock/test flow"
        : "Razorpay is not configured. Payments will use mock mode.",
  });
};

// @route   POST /api/orders/:id/verify-payment
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const isTestMode =
      String(process.env.RAZORPAY_TEST_MODE || "false")
        .trim()
        .toLowerCase() === "true";

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!razorpay_order_id) {
      return res.status(400).json({ message: "Missing razorpay_order_id" });
    }

    if (isTestMode) {
      if (order.paymentDetails?.razorpayOrderId !== razorpay_order_id) {
        return res.status(400).json({ message: "Razorpay order mismatch" });
      }

      order.paymentDetails.status = "Completed";
      order.paymentDetails.razorpayPaymentId =
        razorpay_payment_id || "mock_payment_id";
      await order.save();
      return res.json({ message: "Payment verified successfully (test mode)" });
    }

    // Mock-order verification for local/dev flow without Razorpay credentials
    if (String(razorpay_order_id).startsWith("mock_rp_")) {
      order.paymentDetails.status = "Completed";
      order.paymentDetails.razorpayPaymentId =
        razorpay_payment_id || "mock_payment_id";
      await order.save();
      return res.json({ message: "Payment verified successfully (mock mode)" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ message: "Razorpay key secret is missing" });
    }

    if (!razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message:
          "Missing payment verification fields for live mode (payment_id/signature)",
      });
    }

    if (order.paymentDetails?.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: "Razorpay order mismatch" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      order.paymentDetails.status = "Completed";
      order.paymentDetails.razorpayPaymentId = razorpay_payment_id;
      await order.save();
      return res.json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate("productId", "name price images")
      .populate("sellerId", "name trustScore")
      .sort({ createdAt: -1 });

    await Promise.all(orders.map((order) => markPaymentExpiredIfNeeded(order)));

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("productId")
      .populate("sellerId", "name email trustScore")
      .populate("buyerId", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    if (
      order.buyerId._id.toString() !== req.user._id.toString() &&
      order.sellerId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    await markPaymentExpiredIfNeeded(order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit UPI payment proof (Buyer)
// @route   POST /api/orders/:id/submit-upi-proof
// @access  Private/Buyer
exports.submitUpiPaymentProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.buyerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await markPaymentExpiredIfNeeded(order);

    if (order.paymentDetails?.method !== "UPIManual") {
      return res.status(400).json({ message: "This is not a UPI order" });
    }

    if (order.paymentDetails?.status === PAYMENT_EXPIRED) {
      return res.status(400).json({
        message:
          "Payment session expired. Please create a new order to retry payment.",
      });
    }

    if (!req.file?.path) {
      return res
        .status(400)
        .json({ message: "Payment screenshot is required" });
    }

    const claimedTransactionId = String(
      req.body?.claimedTransactionId || "",
    ).trim();

    if (!claimedTransactionId) {
      return res.status(400).json({
        message: "claimedTransactionId is required",
      });
    }

    order.paymentDetails.proof = {
      screenshotUrl: toStoredUploadUrl(req.file),
      claimedTransactionId,
    };
    order.paymentDetails.submittedAt = new Date();
    order.paymentDetails.status = PAYMENT_SUBMITTED;
    order.paymentDetails.verificationNote =
      "Buyer submitted payment proof for manual verification";
    order.updatedAt = new Date();

    await order.save();
    return res.json({
      message: "Payment proof submitted successfully",
      paymentStatus: order.paymentDetails.status,
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    List UPI payment verification queue (Admin/Seller)
// @route   GET /api/orders/payment-verifications
// @access  Private/AdminOrSeller
exports.getUpiPaymentVerifications = async (req, res) => {
  try {
    const statusFilter = String(req.query?.status || "").trim();
    const normalizedStatusFilter = statusFilter.toLowerCase();

    const query = {
      "paymentDetails.method": "UPIManual",
    };

    if (req.user.role === "seller") {
      query.sellerId = req.user._id;
    }

    if (normalizedStatusFilter && normalizedStatusFilter !== "all") {
      query["paymentDetails.status"] = statusFilter;
    } else {
      query["paymentDetails.status"] = {
        $in: [PAYMENT_SUBMITTED, PAYMENT_PENDING, PAYMENT_EXPIRED],
      };
    }

    const orders = await Order.find(query)
      .populate("buyerId", "name email phone")
      .populate("sellerId", "name email")
      .populate("productId", "name images")
      .sort({ createdAt: -1 });

    await Promise.all(orders.map((order) => markPaymentExpiredIfNeeded(order)));

    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Approve or reject UPI payment proof
// @route   PUT /api/orders/:id/payment-verification
// @access  Private/AdminOrSeller
exports.verifyUpiPaymentProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isSellerOwner =
      req.user.role === "seller" &&
      String(order.sellerId) === String(req.user._id);

    if (!isAdmin && !isSellerOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.paymentDetails?.method !== "UPIManual") {
      return res.status(400).json({ message: "This is not a UPI order" });
    }

    await markPaymentExpiredIfNeeded(order);

    if (order.paymentDetails?.status !== PAYMENT_SUBMITTED) {
      return res.status(400).json({
        message: "Only payment submissions can be approved or rejected",
      });
    }

    const decision = String(req.body?.decision || "").toLowerCase();
    const verificationNote = String(req.body?.verificationNote || "").trim();

    order.paymentDetails.status =
      decision === "approve" ? PAYMENT_VERIFIED : PAYMENT_FAILED;
    order.paymentDetails.verifiedAt = new Date();
    order.paymentDetails.verifiedBy = req.user._id;
    order.paymentDetails.verificationNote = verificationNote;
    order.updatedAt = new Date();

    await order.save();

    return res.json({
      message:
        decision === "approve"
          ? "Payment approved successfully"
          : "Payment rejected successfully",
      paymentStatus: order.paymentDetails.status,
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Packing Proof (Seller)
// @route   POST /api/orders/:id/packing-proof
// @access  Private/Seller
exports.uploadPackingProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      req.user.role !== "seller" ||
      order.sellerId.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Not authorized" });

    const currentStatus = normalizeOrderStatus(order.status);
    if (currentStatus !== "Accepted") {
      return res.status(400).json({
        message: "Packing proof can only be uploaded for accepted orders",
      });
    }

    if (!req.file)
      return res
        .status(400)
        .json({ message: "Please upload packing proof video/image" });

    order.packingProofUrl = toStoredUploadUrl(req.file);
    order.status = "Packed";
    order.updatedAt = new Date();

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept pending order (Seller)
// @route   PUT /api/orders/:id/accept
// @access  Private/Seller
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "seller" ||
      order.sellerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (normalizeOrderStatus(order.status) !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be accepted" });
    }

    if (
      order.paymentDetails?.method === "UPIManual" &&
      order.paymentDetails?.status !== PAYMENT_VERIFIED
    ) {
      return res.status(400).json({
        message:
          "Order can be accepted only after payment is manually verified",
      });
    }

    order.status = "Accepted";
    order.updatedAt = new Date();
    await order.save();

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Reject pending order (Seller)
// @route   PUT /api/orders/:id/reject
// @access  Private/Seller
exports.rejectOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "seller" ||
      order.sellerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (normalizeOrderStatus(order.status) !== "Pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be rejected" });
    }

    order.status = "Rejected";
    order.updatedAt = new Date();
    await order.save();

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Mark packed order as shipped with tracking
// @route   PUT /api/orders/:id/ship
// @access  Private/Seller
exports.shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (
      req.user.role !== "seller" ||
      order.sellerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (normalizeOrderStatus(order.status) !== "Packed") {
      return res
        .status(400)
        .json({ message: "Only packed orders can be marked as shipped" });
    }

    if (!order.packingProofUrl) {
      return res
        .status(400)
        .json({ message: "Packing proof is required before shipping" });
    }

    const trackingId = String(req.body?.trackingId || "").trim();
    const courierName = String(req.body?.courierName || "").trim();

    if (trackingId.length < 8) {
      return res
        .status(400)
        .json({ message: "trackingId must be at least 8 characters" });
    }

    if (!courierName) {
      return res.status(400).json({ message: "courierName is required" });
    }

    order.trackingId = trackingId;
    order.courierName = courierName;
    order.trackingUrl = `https://track.example.com/${trackingId}`;
    order.shippedAt = new Date();
    order.status = "Shipped";
    order.updatedAt = new Date();

    await order.save();
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Mark shipped order as delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/AdminOrSeller
exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isSellerOwner =
      req.user.role === "seller" &&
      order.sellerId.toString() === req.user._id.toString();

    if (!isAdmin && !isSellerOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (normalizeOrderStatus(order.status) !== "Shipped") {
      return res
        .status(400)
        .json({ message: "Only shipped orders can be marked as delivered" });
    }

    order.status = "Delivered";
    order.updatedAt = new Date();

    await order.save();
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
