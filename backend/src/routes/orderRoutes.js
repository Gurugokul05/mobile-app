const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  uploadPackingProof,
  getMyOrders,
  getOrderById,
  getRazorpayDiagnostics,
  acceptOrder,
  rejectOrder,
  shipOrder,
  deliverOrder,
  submitUpiPaymentProof,
  getUpiPaymentVerifications,
  verifyUpiPaymentProof,
} = require("../controllers/orderController");
const {
  protect,
  seller,
  buyer,
  adminOrSeller,
} = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateObjectIdParam,
  validateOrderCreateRequest,
  validatePaymentVerificationRequest,
  validateUpiPaymentSubmissionRequest,
  validateUpiPaymentDecisionRequest,
} = require("../middlewares/validators");

router.get("/razorpay/diagnostics", getRazorpayDiagnostics);

router.route("/").post(protect, buyer, validateOrderCreateRequest, createOrder);

router.route("/my-orders").get(protect, buyer, getMyOrders);

router
  .route("/payment-verifications")
  .get(protect, adminOrSeller, getUpiPaymentVerifications);

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
  .route("/:id/submit-upi-proof")
  .post(
    protect,
    buyer,
    validateObjectIdParam("id"),
    upload.single("paymentProof"),
    validateUpiPaymentSubmissionRequest,
    submitUpiPaymentProof,
  );

router
  .route("/:id/payment-verification")
  .put(
    protect,
    adminOrSeller,
    validateObjectIdParam("id"),
    validateUpiPaymentDecisionRequest,
    verifyUpiPaymentProof,
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

router
  .route("/:id/accept")
  .put(protect, seller, validateObjectIdParam("id"), acceptOrder);

router
  .route("/:id/reject")
  .put(protect, seller, validateObjectIdParam("id"), rejectOrder);

router
  .route("/:id/ship")
  .put(protect, seller, validateObjectIdParam("id"), shipOrder);

router
  .route("/:id/deliver")
  .put(protect, adminOrSeller, validateObjectIdParam("id"), deliverOrder);

module.exports = router;
