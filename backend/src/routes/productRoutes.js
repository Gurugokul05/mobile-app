const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  addProductReview,
} = require("../controllers/productController");
const { protect, adminOrSeller } = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router
  .route("/")
  .get(getProducts)
  .post(protect, adminOrSeller, upload.array("images", 5), createProduct);

router.route("/:id").get(getProductById);
router.route("/:id/reviews").post(protect, addProductReview);

module.exports = router;
