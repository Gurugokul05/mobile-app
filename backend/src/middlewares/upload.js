const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const cloudinaryEnabled =
  String(process.env.USE_CLOUDINARY || "")
    .trim()
    .toLowerCase() === "true";

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

const storage =
  cloudinaryEnabled && hasCloudinaryConfig
    ? new CloudinaryStorage({
        cloudinary,
        params: {
          folder: "roots_uploads",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],
          resource_type: "image",
        },
      })
    : multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname || "") || ".jpg";
          cb(
            null,
            `product_${Date.now()}_${Math.round(Math.random() * 1e9)}${extension}`,
          );
        },
      });

const fileFilter = (_req, file, cb) => {
  if (file?.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }
  cb(new Error("Only image uploads are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 8 * 1024 * 1024,
  },
});

module.exports = upload;
