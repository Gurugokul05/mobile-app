const express = require('express');
const router = express.Router();
const { createRefundRequest, decideRefund } = require('../controllers/refundController');
const { protect, admin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.route('/')
  .post(protect, upload.single('unboxingVideo'), createRefundRequest);

router.route('/:id/decide')
  .put(protect, admin, decideRefund);

module.exports = router;
