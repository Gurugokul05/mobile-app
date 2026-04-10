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
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// Seed database with initial data
seedDatabase().catch((err) => console.error("Seeding error:", err));

const app = express();

app.set("trust proxy", 1);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration - Allow all origins for development
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Explicit CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  helmet({
    // Admin runs on a different dev origin/port, so media from /uploads
    // must be embeddable cross-origin for inline video previews.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const authRoutes = require("./src/routes/authRoutes");
const sellerRoutes = require("./src/routes/sellerRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const refundRoutes = require("./src/routes/refundRoutes");

// Basic Route for testing
app.get("/", (req, res) => {
  res.json({
    message: "Roots API is running...",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", port: process.env.PORT || 5000 });
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

  console.error("Error caught by global handler:", err);

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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found", path: req.path });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✓ Server running on port ${PORT}`);
  console.log(`✓ API available at http://localhost:${PORT}/api`);
  console.log(`✓ Health check at http://localhost:${PORT}/health\n`);
});
