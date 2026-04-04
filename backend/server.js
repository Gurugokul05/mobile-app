require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const connectDB = require("./src/config/db");
const seedDatabase = require("./seeds/seedData");

// Connect to MongoDB
connectDB();

// Seed database with initial data
seedDatabase().catch((err) => console.error("Seeding error:", err));

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const authRoutes = require("./src/routes/authRoutes");
const sellerRoutes = require("./src/routes/sellerRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const refundRoutes = require("./src/routes/refundRoutes");

// Basic Route for testing
app.get("/", (req, res) => {
  res.send("Roots API is running...");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/refunds", refundRoutes);

app.use((err, req, res, next) => {
  if (!err) {
    return next();
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: err.message || "File upload failed",
    });
  }

  if (err?.name === "MulterError") {
    return res.status(400).json({
      message: err.message || "File upload failed",
    });
  }

  if (
    typeof err?.message === "string" &&
    err.message.toLowerCase().includes("cloudinary")
  ) {
    return res.status(500).json({
      message: err.message,
    });
  }

  const errorMessage =
    (typeof err?.message === "string" && err.message.trim()) ||
    err?.error?.message ||
    err?.response?.data?.message ||
    err?.response?.data?.error?.message ||
    "Unexpected server error";

  return res.status(err?.statusCode || 500).json({
    message: errorMessage,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
