const Product = require("../models/Product");

const getDefaultDescription = (product) =>
  `Authentic ${product?.name || "product"} from ${product?.originPlace || "its place of origin"}. Crafted by local sellers and quality-checked.`;

const getReadableErrorMessage = (error) => {
  if (!error) return "Unable to process request";

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  const nestedMessage =
    error?.error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error?.message;

  if (typeof nestedMessage === "string" && nestedMessage.trim()) {
    return nestedMessage;
  }

  const asString = String(error);
  return asString && asString !== "[object Object]"
    ? asString
    : "Unable to process request";
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate(
      "sellerId",
      "name trustScore isVerified",
    );
    const normalizedProducts = products.map((productDoc) => {
      const product = productDoc.toObject();
      if (!product.description || !String(product.description).trim()) {
        product.description = getDefaultDescription(product);
      }
      return product;
    });
    res.json(normalizedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const productDoc = await Product.findById(req.params.id).populate(
      "sellerId",
      "name isVerified trustScore",
    );
    if (productDoc) {
      const product = productDoc.toObject();
      if (!product.description || !String(product.description).trim()) {
        product.description = getDefaultDescription(product);
      }
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Seller
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, originPlace } = req.body;
    const parsedPrice = Number(price);

    if (req.user.role !== "seller") {
      return res.status(401).json({ message: "Only sellers can add products" });
    }

    if (!name || !description || !originPlace || Number.isNaN(parsedPrice)) {
      return res.status(400).json({
        message:
          "Please provide valid product details (name, description, origin place, and numeric price).",
      });
    }

    const imageUrls = (req.files || [])
      .map((file) => {
        if (file?.path && /^https?:\/\//i.test(file.path)) {
          return file.path;
        }
        if (file?.secure_url) {
          return file.secure_url;
        }
        if (file?.url && /^https?:\/\//i.test(file.url)) {
          return file.url;
        }
        if (file?.filename) {
          return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
        }
        return null;
      })
      .filter(Boolean);

    const product = new Product({
      name,
      description,
      price: parsedPrice,
      originPlace,
      images: imageUrls,
      sellerId: req.user._id,
      isVerified: Boolean(req.user.isVerified),
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    const readableMessage = getReadableErrorMessage(error);
    console.error("Create product failed:", {
      message: readableMessage,
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
      rawError: error,
    });
    res.status(500).json({
      message:
        readableMessage ||
        "Unable to create product right now. Please try again in a moment.",
    });
  }
};

// @desc    Add or update product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = product.reviews.find(
      (review) => String(review.user) === String(req.user._id),
    );

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = String(comment || "").trim();
      existingReview.name = req.user.name;
    } else {
      product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: numericRating,
        comment: String(comment || "").trim(),
      });
    }

    product.numReviews = product.reviews.length;
    product.rating =
      product.numReviews > 0
        ? Number(
            (
              product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.numReviews
            ).toFixed(1),
          )
        : 0;

    const updated = await product.save();
    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
