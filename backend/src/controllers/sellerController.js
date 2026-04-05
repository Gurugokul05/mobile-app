const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc    Upload seller verification documents
// @route   POST /api/seller/verify
// @access  Private (Seller)
exports.uploadVerificationDocs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.role !== "seller") {
      return res.status(400).json({ message: "User is not a seller" });
    }

    if (
      !req.files ||
      !req.files.idProof?.length ||
      !req.files.locationProof?.length ||
      !req.files.makingProof?.length
    ) {
      return res
        .status(400)
        .json({
          message:
            "Please upload all required files (ID, location, and making proof)",
        });
    }

    user.verificationDocs = {
      idProofUrl: req.files.idProof
        ? req.files.idProof[0].path
        : user.verificationDocs?.idProofUrl,
      locationProofUrl: req.files.locationProof
        ? req.files.locationProof[0].path
        : user.verificationDocs?.locationProofUrl,
      makingProofUrl: req.files.makingProof
        ? req.files.makingProof[0].path
        : user.verificationDocs?.makingProofUrl,
    };

    user.isVerified = false; // Pending admin approval

    await user.save();

    res.json({
      message: "Verification documents uploaded successfully",
      docs: user.verificationDocs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject seller verification (Admin)
// @route   PUT /api/seller/:id/verify
// @access  Private/Admin
exports.verifySeller = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const seller = await User.findById(req.params.id);

    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (status === "approved") {
      seller.isVerified = true;
    } else {
      seller.isVerified = false;
    }

    await seller.save();
    res.json({
      message: `Seller verification ${status}`,
      isVerified: seller.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller dashboard stats
// @route   GET /api/seller/me/stats
// @access  Private/Seller
exports.getMySellerStats = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const [totalProducts, totalOrders, deliveredOrders, revenueRows] =
      await Promise.all([
        Product.countDocuments({ sellerId: req.user._id }),
        Order.countDocuments({ sellerId: req.user._id }),
        Order.countDocuments({ sellerId: req.user._id, status: "Delivered" }),
        Order.aggregate([
          {
            $match: {
              sellerId: req.user._id,
              "paymentDetails.status": "Completed",
            },
          },
          { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
        ]),
      ]);

    const totalRevenue = revenueRows[0]?.totalRevenue || 0;

    res.json({
      trustScore: req.user.trustScore || 0,
      isVerified: !!req.user.isVerified,
      totalProducts,
      totalOrders,
      deliveredOrders,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller products
// @route   GET /api/seller/me/products
// @access  Private/Seller
exports.getMySellerProducts = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const products = await Product.find({ sellerId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller orders
// @route   GET /api/seller/me/orders
// @access  Private/Seller
exports.getMySellerOrders = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const orders = await Order.find({ sellerId: req.user._id })
      .populate("productId", "name images price")
      .populate("buyerId", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller revenue timeline
// @route   GET /api/seller/me/revenue
// @access  Private/Seller
exports.getMySellerRevenue = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const revenueByMonth = await Order.aggregate([
      {
        $match: {
          sellerId: req.user._id,
          "paymentDetails.status": "Completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const points = revenueByMonth.map((entry) => ({
      label: `${entry._id.month}/${String(entry._id.year).slice(-2)}`,
      revenue: entry.revenue,
      orders: entry.orders,
    }));

    res.json(points);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
