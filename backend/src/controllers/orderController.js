const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("crypto");
const Razorpay = require("razorpay");

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

// @desc    Create new order & Razorpay order
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

    const totalPrice = product.price * quantity;

    const isTestMode =
      String(process.env.RAZORPAY_TEST_MODE || "false")
        .trim()
        .toLowerCase() === "true";

    // Create Razorpay order whenever keys are configured; fallback to mock only if unavailable.
    let rpOrder;
    const canUseRazorpayApi =
      !isTestMode &&
      Boolean(razorpayInstance) &&
      Boolean(process.env.RAZORPAY_KEY_ID) &&
      Boolean(process.env.RAZORPAY_KEY_SECRET);

    if (canUseRazorpayApi) {
      const options = {
        amount: totalPrice * 100, // amount in smallest currency unit
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
      };
      rpOrder = await razorpayInstance.orders.create(options);
    } else {
      // Mocked in test mode and local development
      rpOrder = { id: `mock_rp_${Date.now()}` };
    }

    const order = new Order({
      buyerId: req.user._id,
      sellerId: product.sellerId,
      productId,
      quantity,
      totalPrice,
      status: "Pending",
      paymentDetails: {
        razorpayOrderId: rpOrder.id,
        status: "Pending",
      },
      shippingAddress,
    });

    const createdOrder = await order.save();
    res.status(201).json({
      order: createdOrder,
      rpOrderId: rpOrder.id,
      amount: totalPrice * 100,
      paymentMode: canUseRazorpayApi ? "razorpay" : "mock",
      razorpayKeyId: canUseRazorpayApi ? process.env.RAZORPAY_KEY_ID : null,
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
      order.sellerId._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    order.packingProofUrl = req.file.path;
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
