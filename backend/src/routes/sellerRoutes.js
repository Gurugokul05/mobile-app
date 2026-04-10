const express = require("express");
const router = express.Router();
const {
  uploadVerificationDocs,
  verifySeller,
  verifySellerComplianceDocument,
  getAllSellersForAdmin,
  getSellerVerificationDetails,
  getAllVerifications,
  getAllComplianceVerificationsForAdmin,
  getPublicSellerProfile,
  getMySellerStats,
  getMySellerProducts,
  getMySellerOrders,
  getMySellerRevenue,
  getMyStoreSettings,
  updateMyStoreSettings,
  getMySellerCompliance,
  uploadMySellerComplianceDocs,
  getMySellerTransactions,
  getMySellerSecurity,
  updateMySellerTwoFactor,
  getDetailedRevenueInsights,
  downloadRevenueInsightsPDF,
} = require("../controllers/sellerController");
const { protect, seller, admin } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateSellerDecisionRequest,
  validateComplianceDocDecisionRequest,
  validateObjectIdParam,
} = require("../middlewares/validators");

// Multer error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error("❌ [MULTER ERROR]", err.message, err.code);
    return res.status(400).json({
      message: err.message || "File upload failed",
      code: err.code,
    });
  }
  next();
};

// Specific routes must come BEFORE parameter routes to avoid conflicts
router.get("/public/:id", validateObjectIdParam("id"), getPublicSellerProfile);
router.get("/admin/list", protect, admin, getAllSellersForAdmin);
router.get("/admin/sellers", protect, admin, getAllSellersForAdmin);
router.get("/admin/all-verifications", protect, admin, getAllVerifications);
router.get(
  "/admin/compliance-verifications",
  protect,
  admin,
  getAllComplianceVerificationsForAdmin,
);
router.get("/me/stats", protect, seller, getMySellerStats);
router.get("/me/products", protect, seller, getMySellerProducts);
router.get("/me/orders", protect, seller, getMySellerOrders);
router.get("/me/revenue", protect, seller, getMySellerRevenue);
router.get("/me/store-settings", protect, seller, getMyStoreSettings);
router.put("/me/store-settings", protect, seller, updateMyStoreSettings);
router.get("/me/compliance", protect, seller, getMySellerCompliance);
router.post(
  "/me/compliance/upload",
  protect,
  seller,
  upload.fields([
    { name: "gstCertificate", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 },
  ]),
  handleMulterError,
  uploadMySellerComplianceDocs,
);
router.get("/me/transactions", protect, seller, getMySellerTransactions);
router.get("/me/security", protect, seller, getMySellerSecurity);
router.put("/me/security/2fa", protect, seller, updateMySellerTwoFactor);
router.get(
  "/me/insights/detailed",
  protect,
  seller,
  getDetailedRevenueInsights,
);
router.get("/me/insights/pdf", protect, seller, downloadRevenueInsightsPDF);

// Parameter-based routes come after
router.post(
  "/verify",
  protect,
  seller,
  (req, res, next) => {
    console.log("📨 [SELLER VERIFY] POST /verify received");
    console.log("📨 [SELLER VERIFY] Headers:", {
      contentType: req.headers["content-type"],
      contentLength: req.headers["content-length"],
    });

    upload.fields([
      { name: "idProof", maxCount: 1 },
      { name: "locationProof", maxCount: 1 },
      { name: "makingProof", maxCount: 1 },
    ])(req, res, (err) => {
      if (err) {
        console.error("❌ [UPLOAD MIDDLEWARE]", {
          message: err.message,
          code: err.code,
          field: err.field,
        });
        return res.status(400).json({
          message: err.message || "File upload failed",
          code: err.code,
        });
      }
      console.log("📨 [MULTER PARSED] Files:", Object.keys(req.files || {}));
      next();
    });
  },
  uploadVerificationDocs,
);

router.put(
  "/:id/compliance/verify",
  protect,
  admin,
  validateObjectIdParam("id"),
  validateComplianceDocDecisionRequest,
  verifySellerComplianceDocument,
);

router.put(
  "/:id/verify",
  protect,
  admin,
  validateObjectIdParam("id"),
  validateSellerDecisionRequest,
  verifySeller,
);
router.get(
  "/:id/verification",
  protect,
  admin,
  validateObjectIdParam("id"),
  getSellerVerificationDetails,
);

module.exports = router;
