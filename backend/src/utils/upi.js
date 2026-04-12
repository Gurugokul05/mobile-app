const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/;

const normalizeUpiId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isValidUpiId = (value) => UPI_ID_REGEX.test(normalizeUpiId(value));

const maskUpiId = (value) => {
  const normalized = normalizeUpiId(value);
  if (!normalized || !normalized.includes("@")) return "";

  const [handle, provider] = normalized.split("@");
  if (!handle || !provider) return "";

  const visiblePrefix = handle.slice(0, 2);
  const maskedMiddle = "*".repeat(Math.max(handle.length - 2, 2));
  return `${visiblePrefix}${maskedMiddle}@${provider}`;
};

module.exports = {
  UPI_ID_REGEX,
  normalizeUpiId,
  isValidUpiId,
  maskUpiId,
};
