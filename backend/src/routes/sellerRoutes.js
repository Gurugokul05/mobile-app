const express = require("express");
const router = express.Router();
const {
  uploadVerificationDocs,
  verifySeller,
  getMySellerStats,
  getMySellerProducts,
  getMySellerOrders,
  getMySellerRevenue,
} = require("../controllers/sellerController");
const { protect, adminOrSeller, admin } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.post(
  "/verify",
  protect,
  adminOrSeller,
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "locationProof", maxCount: 1 },
    { name: "makingProof", maxCount: 1 },
  ]),
  uploadVerificationDocs,
);

router.put("/:id/verify", protect, admin, verifySeller);
router.get("/me/stats", protect, adminOrSeller, getMySellerStats);
router.get("/me/products", protect, adminOrSeller, getMySellerProducts);
router.get("/me/orders", protect, adminOrSeller, getMySellerOrders);
router.get("/me/revenue", protect, adminOrSeller, getMySellerRevenue);

module.exports = router;
