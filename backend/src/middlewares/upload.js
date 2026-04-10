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
        params: async (_req, file) => {
          const fieldName = String(file?.fieldname || "");
          const isVideoField =
            fieldName === "makingProof" || fieldName === "unboxingVideo";

          return {
            folder: isVideoField
              ? "roots_uploads/making_proofs"
              : "roots_uploads/images",
            resource_type: isVideoField ? "video" : "image",
            allowed_formats: isVideoField
              ? ["mp4", "mov", "avi", "mkv", "webm"]
              : ["jpg", "jpeg", "png", "webp"],
          };
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
  const mimeType = String(file?.mimetype || "").toLowerCase();
  const fieldName = String(file?.fieldname || "");

  const isImage = mimeType.startsWith("image/");
  const isVideoForAllowedField =
    (fieldName === "makingProof" || fieldName === "unboxingVideo") &&
    mimeType.startsWith("video/");

  if (isImage || isVideoForAllowedField) {
    cb(null, true);
    return;
  }
  cb(
    new Error(
      "Only images are allowed (making proof and unboxing video can be video)",
    ),
  );
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    files: 5,
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = upload;
