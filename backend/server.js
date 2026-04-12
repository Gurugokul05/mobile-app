require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const connectDB = require("./src/config/db");
const seedDatabase = require("./seeds/seedData");

const isProduction = process.env.NODE_ENV === "production";
const corsAllowList = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// Connect to MongoDB
connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err.message);
  process.exit(1);
});

// Seed data only when explicitly enabled (default: disabled)
const shouldSeedOnStartup =
  String(process.env.SEED_ON_STARTUP || "false")
    .trim()
    .toLowerCase() === "true";

if (shouldSeedOnStartup) {
  seedDatabase().catch((err) => console.error("Seeding error:", err));
}

const app = express();

app.set("trust proxy", 1);

// Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// CORS Configuration
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!isProduction) {
        return callback(null, true);
      }

      if (corsAllowList.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

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
