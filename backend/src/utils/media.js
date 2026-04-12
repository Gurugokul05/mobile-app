const path = require("path");

const toStoredUploadUrl = (file) => {
  if (!file) {
    return "";
  }

  const filePath = String(
    file.path || file.secure_url || file.url || "",
  ).trim();

  // Cloud providers generally return full URLs.
  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  if (filePath.startsWith("/uploads/")) {
    return filePath;
  }

  const filename = String(
    file.filename || path.basename(filePath) || "",
  ).trim();
  if (!filename) {
    return "";
  }

  return `/uploads/${filename}`;
};

const toPublicMediaUrl = (req, value) => {
  const rawValue = String(value || "").trim();
  if (!rawValue) {
    return "";
  }

  const host = req?.get ? req.get("host") : "";
  const protocol = req?.protocol || "http";

  if (/^https?:\/\//i.test(rawValue)) {
    // If it is a previously saved local uploads URL (old LAN IP), rewrite host.
    // Cloudinary/external CDN URLs should pass through unchanged.
    try {
      const parsed = new URL(rawValue);
      if (parsed.pathname.startsWith("/uploads/") && host) {
        return `${protocol}://${host}${parsed.pathname}`;
      }
    } catch (_error) {
      // Fall through and return as-is for malformed URLs.
    }

    return rawValue;
  }

  if (!req) {
    return rawValue;
  }

  if (!host) {
    return rawValue;
  }

  return `${protocol}://${host}${rawValue.startsWith("/") ? rawValue : `/${rawValue}`}`;
};

module.exports = {
  toStoredUploadUrl,
  toPublicMediaUrl,
};
