const express = require("express");
const router = express.Router();
const {
  createRefundRequest,
  decideRefund,
  getAllRefunds,
} = require("../controllers/refundController");
const { protect, admin, buyer } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateObjectIdParam,
  validateRefundCreateRequest,
  validateRefundDecisionRequest,
} = require("../middlewares/validators");

router
  .route("/")
  .get(protect, admin, getAllRefunds)
  .post(
    protect,
    buyer,
    validateRefundCreateRequest,
    upload.single("unboxingVideo"),
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

module.exports = router;
