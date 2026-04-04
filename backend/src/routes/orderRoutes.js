const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  uploadPackingProof,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, adminOrSeller } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.route("/").post(protect, createOrder);

router.route("/my-orders").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router.route("/:id/verify-payment").post(protect, verifyPayment);

router
  .route("/:id/packing-proof")
  .post(
    protect,
    adminOrSeller,
    upload.single("packingProof"),
    uploadPackingProof,
  );

module.exports = router;
