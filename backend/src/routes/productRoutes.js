const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  addProductReview,
} = require("../controllers/productController");
const { protect, adminOrSeller, seller } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const {
  validateObjectIdParam,
  validateProductCreateRequest,
  validateProductUpdateRequest,
  validateReviewRequest,
} = require("../middlewares/validators");

router
  .route("/")
  .get(getProducts)
  .post(
    protect,
    seller,
    upload.array("images", 5),
    validateProductCreateRequest,
    createProduct,
  );

router
  .route("/:id")
  .get(getProductById)
  .put(
    protect,
    adminOrSeller,
    validateObjectIdParam("id"),
    upload.array("images", 5),
    validateProductUpdateRequest,
    updateProduct,
  );
router
  .route("/:id/reviews")
  .post(
    protect,
    validateObjectIdParam("id"),
    validateReviewRequest,
    addProductReview,
  );

module.exports = router;
