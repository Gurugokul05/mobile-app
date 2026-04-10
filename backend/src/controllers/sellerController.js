const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const RefundRequest = require("../models/RefundRequest");
const SellerVerification = require("../models/SellerVerification");
const { createRevenueInsightsPdf } = require("../utils/revenueInsightsPdf");

const normalizeComplianceDocs = (docs) => ({
  gstCertificate: {
    url: docs?.gstCertificate?.url || "",
    status: docs?.gstCertificate?.status || "not_verified",
    uploadedAt: docs?.gstCertificate?.uploadedAt || null,
    reviewedAt: docs?.gstCertificate?.reviewedAt || null,
    rejectionReason: docs?.gstCertificate?.rejectionReason || "",
  },
  businessLicense: {
    url: docs?.businessLicense?.url || "",
    status: docs?.businessLicense?.status || "not_verified",
    uploadedAt: docs?.businessLicense?.uploadedAt || null,
    reviewedAt: docs?.businessLicense?.reviewedAt || null,
    rejectionReason: docs?.businessLicense?.rejectionReason || "",
  },
});

const toPublicDocUrl = (req, file) => {
  if (!file) {
    return "";
  }

  if (file.path) {
    return String(file.path).replace(/\\/g, "/");
  }

  if (file.filename) {
    return `/uploads/${file.filename}`;
  }

  return "";
};

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
      return res.status(400).json({
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

// @desc    Public seller profile
// @route   GET /api/seller/public/:id
// @access  Public
exports.getPublicSellerProfile = async (req, res) => {
  try {
    const seller = await User.findOne({ _id: req.params.id, role: "seller" })
      .select(
        "name email location description about specialties certifications responseTime returnRate yearsInBusiness totalOrders totalReviews averageRating avatar trustScore isVerified",
      )
      .lean();

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.json(seller);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sellers for admin
// @route   GET /api/seller/admin/list
// @access  Private/Admin
exports.getAllSellersForAdmin = async (_req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select(
        "name email phone location isVerified trustScore createdAt complianceDocs verificationDocs",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.json(sellers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all seller verification requests
// @route   GET /api/seller/admin/all-verifications
// @access  Private/Admin
exports.getAllVerifications = async (_req, res) => {
  try {
    const rows = await SellerVerification.find({})
      .populate("sellerId", "name email isVerified trustScore")
      .populate("reviewedBy", "name email")
      .sort({ submittedAt: -1 })
      .lean();

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all compliance verification records
// @route   GET /api/seller/admin/compliance-verifications
// @access  Private/Admin
exports.getAllComplianceVerificationsForAdmin = async (_req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("name email isVerified trustScore complianceDocs createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const data = sellers.map((seller) => ({
      ...seller,
      complianceDocs: normalizeComplianceDocs(seller.complianceDocs),
    }));

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get verification details for a seller
// @route   GET /api/seller/:id/verification
// @access  Private/Admin
exports.getSellerVerificationDetails = async (req, res) => {
  try {
    const [seller, verification] = await Promise.all([
      User.findOne({ _id: req.params.id, role: "seller" })
        .select(
          "name email phone isVerified trustScore verificationDocs complianceDocs location description",
        )
        .lean(),
      SellerVerification.findOne({ sellerId: req.params.id })
        .sort({ submittedAt: -1 })
        .populate("reviewedBy", "name email")
        .lean(),
    ]);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.json({
      seller: {
        ...seller,
        complianceDocs: normalizeComplianceDocs(seller.complianceDocs),
      },
      verification: verification || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Reject seller compliance document
// @route   PUT /api/seller/:id/compliance/verify
// @access  Private/Admin
exports.verifySellerComplianceDocument = async (req, res) => {
  try {
    const { status, docType, rejectionReason } = req.body;
    const seller = await User.findOne({ _id: req.params.id, role: "seller" });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const docs = normalizeComplianceDocs(seller.complianceDocs);
    docs[docType] = {
      ...docs[docType],
      status: status === "approved" ? "verified" : "rejected",
      reviewedAt: new Date(),
      rejectionReason: status === "rejected" ? rejectionReason || "" : "",
    };

    seller.complianceDocs = docs;
    await seller.save();

    return res.json({
      message: `${docType} ${status}`,
      complianceDocs: normalizeComplianceDocs(seller.complianceDocs),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller compliance status
// @route   GET /api/seller/me/compliance
// @access  Private/Seller
exports.getMySellerCompliance = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const seller = await User.findById(req.user._id).select(
      "isVerified complianceDocs",
    );

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.json({
      isVerified: !!seller.isVerified,
      complianceDocs: normalizeComplianceDocs(seller.complianceDocs),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Upload seller compliance documents
// @route   POST /api/seller/me/compliance/upload
// @access  Private/Seller
exports.uploadMySellerComplianceDocs = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const seller = await User.findById(req.user._id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const gstFile = req.files?.gstCertificate?.[0] || null;
    const businessFile = req.files?.businessLicense?.[0] || null;

    if (!gstFile && !businessFile) {
      return res
        .status(400)
        .json({ message: "Please upload at least one document" });
    }

    const now = new Date();
    const docs = normalizeComplianceDocs(seller.complianceDocs);

    if (gstFile) {
      docs.gstCertificate = {
        ...docs.gstCertificate,
        url: toPublicDocUrl(req, gstFile),
        status: "uploaded",
        uploadedAt: now,
        reviewedAt: null,
        rejectionReason: "",
      };
    }

    if (businessFile) {
      docs.businessLicense = {
        ...docs.businessLicense,
        url: toPublicDocUrl(req, businessFile),
        status: "uploaded",
        uploadedAt: now,
        reviewedAt: null,
        rejectionReason: "",
      };
    }

    seller.complianceDocs = docs;
    await seller.save();

    return res.json({
      message: "Compliance documents uploaded successfully",
      complianceDocs: normalizeComplianceDocs(seller.complianceDocs),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller store settings
// @route   GET /api/seller/me/store-settings
// @access  Private/Seller
exports.getMyStoreSettings = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const seller = await User.findById(req.user._id).select("storeSettings");
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.json(
      seller.storeSettings || {
        bannerUrl: "",
        themeColor: "#007AFF",
        logoUrl: "",
      },
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller store settings
// @route   PUT /api/seller/me/store-settings
// @access  Private/Seller
exports.updateMyStoreSettings = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const seller = await User.findById(req.user._id);
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const nextSettings = {
      bannerUrl: req.body?.bannerUrl ?? seller.storeSettings?.bannerUrl ?? "",
      themeColor:
        req.body?.themeColor ?? seller.storeSettings?.themeColor ?? "#007AFF",
      logoUrl: req.body?.logoUrl ?? seller.storeSettings?.logoUrl ?? "",
    };

    seller.storeSettings = nextSettings;
    await seller.save();
    return res.json(nextSettings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Seller transactions list
// @route   GET /api/seller/me/transactions
// @access  Private/Seller
exports.getMySellerTransactions = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const transactions = await Order.find({
      sellerId: req.user._id,
      "paymentDetails.status": "Completed",
    })
      .populate("buyerId", "name email")
      .populate("productId", "name")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Seller security details
// @route   GET /api/seller/me/security
// @access  Private/Seller
exports.getMySellerSecurity = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const seller = await User.findById(req.user._id)
      .select("twoFactorEnabled lastLoginAt loginActivity")
      .lean();

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.json({
      twoFactorEnabled: !!seller.twoFactorEnabled,
      lastLoginAt: seller.lastLoginAt || null,
      loginActivity: (seller.loginActivity || []).slice(-20).reverse(),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle seller two-factor
// @route   PUT /api/seller/me/security/2fa
// @access  Private/Seller
exports.updateMySellerTwoFactor = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const enabled = Boolean(req.body?.enabled);
    const seller = await User.findById(req.user._id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    seller.twoFactorEnabled = enabled;
    await seller.save();

    return res.json({ twoFactorEnabled: !!seller.twoFactorEnabled });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Detailed revenue insights
// @route   GET /api/seller/me/insights/detailed
// @access  Private/Seller
exports.getDetailedRevenueInsights = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const [stats, monthlyRevenue, dailyRevenue, topProducts] =
      await Promise.all([
        Order.aggregate([
          {
            $match: {
              sellerId: req.user._id,
              "paymentDetails.status": "Completed",
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$totalPrice" },
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Order.aggregate([
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
        ]),
        Order.aggregate([
          {
            $match: {
              sellerId: req.user._id,
              "paymentDetails.status": "Completed",
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              revenue: { $sum: "$totalPrice" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]),
        Order.aggregate([
          {
            $match: {
              sellerId: req.user._id,
              "paymentDetails.status": "Completed",
            },
          },
          {
            $group: {
              _id: "$productId",
              totalSales: { $sum: "$totalPrice" },
              orderCount: { $sum: 1 },
            },
          },
          { $sort: { totalSales: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productData",
            },
          },
          {
            $unwind: { path: "$productData", preserveNullAndEmptyArrays: true },
          },
        ]),
      ]);

    const totalRevenue = stats[0]?.totalRevenue || 0;
    const totalOrders = stats[0]?.totalOrders || 0;

    return res.json({
      summary: {
        totalRevenue,
        totalOrders,
        avgOrderValue: totalRevenue / (totalOrders || 1),
      },
      monthlyRevenue,
      dailyRevenue,
      topProducts: topProducts.map((row) => ({
        productId: row._id,
        productName: row.productData?.name || "Unknown",
        totalSales: row.totalSales || 0,
        orderCount: row.orderCount || 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Download revenue insights PDF
// @route   GET /api/seller/me/insights/pdf
// @access  Private/Seller
exports.downloadRevenueInsightsPDF = async (req, res) => {
  try {
    if (req.user.role !== "seller") {
      return res
        .status(403)
        .json({ message: "Only sellers can access this endpoint" });
    }

    const seller = await User.findById(req.user._id)
      .select("name email trustScore isVerified averageRating complianceDocs")
      .lean();

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const [allOrders, paidOrders, topProductsAgg] = await Promise.all([
      Order.find({ sellerId: req.user._id })
        .select("totalPrice status createdAt paymentDetails")
        .lean(),
      Order.find({
        sellerId: req.user._id,
        "paymentDetails.status": "Completed",
      })
        .select("totalPrice status createdAt productId")
        .lean(),
      Order.aggregate([
        {
          $match: {
            sellerId: req.user._id,
            "paymentDetails.status": "Completed",
          },
        },
        {
          $group: {
            _id: "$productId",
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 12 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          $unwind: { path: "$productData", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 0,
            name: { $ifNull: ["$productData.name", "Unknown Product"] },
            revenue: 1,
            orders: 1,
          },
        },
      ]),
    ]);

    const completedOrderIds = paidOrders.map((order) => order._id);
    const refundsCount = completedOrderIds.length
      ? await RefundRequest.countDocuments({
          orderId: { $in: completedOrderIds },
        })
      : 0;

    const includeAppendix = ["1", "true", "yes", "on"].includes(
      String(req.query?.includeAppendix || "").toLowerCase(),
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="roots-revenue-insights-${String(req.user._id)}.pdf"`,
    );

    await createRevenueInsightsPdf(res, {
      seller,
      allOrders,
      paidOrders,
      topProducts: topProductsAgg,
      refundsCount,
      platformFeeRate: 0.08,
      generatedAt: new Date(),
      includeAppendix,
    });

    return null;
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
