const express = require("express");
const router = express.Router();
const {
  createRefundRequest,
  decideRefund,
  getAllRefunds,
  getSellerRefunds,
  respondRefund,
  getMyRefunds,
  decideRefundAsSeller,
} = require("../controllers/refundController");
const { protect, admin, buyer, seller } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateObjectIdParam,
  validateRefundCreateRequest,
  validateRefundDecisionRequest,
  validateSellerRefundResponseRequest,
  validateSellerRefundDecisionRequest,
} = require("../middlewares/validators");

router.route("/my").get(protect, buyer, getMyRefunds);

router.route("/seller").get(protect, seller, getSellerRefunds);

router
  .route("/")
  .get(protect, admin, getAllRefunds)
  .post(
    protect,
    buyer,
    upload.single("unboxingVideo"),
    validateRefundCreateRequest,
    createRefundRequest,
  );

router
  .route("/:id/decide")
  .put(
    protect,
    admin,
    validateObjectIdParam("id"),
    validateRefundDecisionRequest,
    decideRefund,
  );

router
  .route("/:id/respond")
  .put(
    protect,
    seller,
    validateObjectIdParam("id"),
    validateSellerRefundResponseRequest,
    respondRefund,
  );

router
  .route("/:id/seller-decision")
  .put(
    protect,
    seller,
    validateObjectIdParam("id"),
    validateSellerRefundDecisionRequest,
    decideRefundAsSeller,
  );

module.exports = router;
