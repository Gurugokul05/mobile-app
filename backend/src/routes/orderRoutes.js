const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  uploadPackingProof,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect, seller, buyer } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateObjectIdParam,
  validateOrderCreateRequest,
  validatePaymentVerificationRequest,
} = require("../middlewares/validators");

router.route("/").post(protect, buyer, validateOrderCreateRequest, createOrder);

router.route("/my-orders").get(protect, buyer, getMyOrders);

router.route("/:id").get(protect, validateObjectIdParam("id"), getOrderById);

router
  .route("/:id/verify-payment")
  .post(
    protect,
    buyer,
    validateObjectIdParam("id"),
    validatePaymentVerificationRequest,
    verifyPayment,
  );

router
  .route("/:id/packing-proof")
  .post(
    protect,
    seller,
    validateObjectIdParam("id"),
    upload.single("packingProof"),
    uploadPackingProof,
  );

module.exports = router;
