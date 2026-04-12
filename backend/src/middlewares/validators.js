const mongoose = require("mongoose");

const isPlainObject = (value) =>
  Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";

const trimmedString = (value) =>
  typeof value === "string" ? value.trim() : "";

const isEmail = (value) => /^\S+@\S+\.\S+$/.test(String(value || ""));

const isPositiveInteger = (value) =>
  Number.isInteger(Number(value)) && Number(value) > 0;

const isPositiveNumber = (value) =>
  Number.isFinite(Number(value)) && Number(value) > 0;

const isObjectId = (value) =>
  typeof value === "string" && mongoose.Types.ObjectId.isValid(value);

const fail = (res, message, details) =>
  res.status(400).json(details ? { message, details } : { message });

const validateObjectIdParam = (paramName) => (req, res, next) => {
  if (!isObjectId(req.params?.[paramName])) {
    return fail(res, `Invalid ${paramName}`);
  }
  return next();
};

const validateRegisterRequest = (req, res, next) => {
  const name = trimmedString(req.body?.name);
  const email = trimmedString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || "");
  const role = trimmedString(req.body?.role) || "buyer";

  if (!name || name.length < 2 || name.length > 80) {
    return fail(res, "name must be between 2 and 80 characters");
  }

  if (!isEmail(email)) {
    return fail(res, "A valid email is required");
  }

  if (password.length < 6) {
    return fail(res, "Password must be at least 6 characters");
  }

  if (!["buyer", "seller"].includes(role)) {
    return fail(res, "role must be either buyer or seller");
  }

  req.body = { ...req.body, name, email, password, role };
  return next();
};

const validateEmailBody = (req, res, next) => {
  const email = trimmedString(req.body?.email).toLowerCase();
  if (!isEmail(email)) {
    return fail(res, "A valid email is required");
  }
  req.body = { ...req.body, email };
  return next();
};

const validateResetPasswordRequest = (req, res, next) => {
  const email = trimmedString(req.body?.email).toLowerCase();
  const otp = trimmedString(req.body?.otp);
  const newPassword = String(req.body?.newPassword || "");

  if (!isEmail(email)) {
    return fail(res, "A valid email is required");
  }

  if (!/^\d{6}$/.test(otp)) {
    return fail(res, "otp must be a 6-digit code");
  }

  if (newPassword.length < 6) {
    return fail(res, "newPassword must be at least 6 characters");
  }

  req.body = { ...req.body, email, otp, newPassword };
  return next();
};

const validateLoginRequest = (req, res, next) => {
  const email = trimmedString(req.body?.email).toLowerCase();
  const password = String(req.body?.password || "");

  if (!isEmail(email)) {
    return fail(res, "A valid email is required");
  }

  if (password.length < 6) {
    return fail(res, "Password must be at least 6 characters");
  }

  req.body = { ...req.body, email, password };
  return next();
};

const validateLoginTwoFactorVerifyRequest = (req, res, next) => {
  const twoFactorSessionId = trimmedString(req.body?.twoFactorSessionId);
  const otp = trimmedString(req.body?.otp);

  if (!twoFactorSessionId || twoFactorSessionId.length < 16) {
    return fail(res, "twoFactorSessionId is required");
  }

  if (!/^\d{6}$/.test(otp)) {
    return fail(res, "otp must be a 6-digit code");
  }

  req.body = { ...req.body, twoFactorSessionId, otp };
  return next();
};

const validateLoginTwoFactorResendRequest = (req, res, next) => {
  const twoFactorSessionId = trimmedString(req.body?.twoFactorSessionId);

  if (!twoFactorSessionId || twoFactorSessionId.length < 16) {
    return fail(res, "twoFactorSessionId is required");
  }

  req.body = { ...req.body, twoFactorSessionId };
  return next();
};

const validateDeleteAccountOtpConfirmRequest = (req, res, next) => {
  const otp = trimmedString(req.body?.otp);

  if (!/^\d{6}$/.test(otp)) {
    return fail(res, "otp must be a 6-digit code");
  }

  req.body = {
    ...req.body,
    otp,
  };

  return next();
};

const validateProfileUpdateRequest = (req, res, next) => {
  const body = req.body || {};
  const sanitized = { ...body };

  const stringFields = [
    "name",
    "phone",
    "address",
    "location",
    "description",
    "about",
    "responseTime",
    "returnRate",
    "avatar",
  ];

  for (const field of stringFields) {
    if (body[field] !== undefined) {
      if (typeof body[field] !== "string") {
        return fail(res, `${field} must be a string`);
      }
      sanitized[field] = body[field].trim();
    }
  }

  if (
    body.name !== undefined &&
    (sanitized.name.length < 2 || sanitized.name.length > 80)
  ) {
    return fail(res, "name must be between 2 and 80 characters");
  }

  if (
    body.phone !== undefined &&
    sanitized.phone &&
    !/^[0-9+()\-\s]{6,20}$/.test(sanitized.phone)
  ) {
    return fail(res, "phone has an invalid format");
  }

  if (body.description !== undefined && sanitized.description.length > 1000) {
    return fail(res, "description must be 1000 characters or less");
  }

  if (body.about !== undefined && sanitized.about.length > 2000) {
    return fail(res, "about must be 2000 characters or less");
  }

  if (body.responseTime !== undefined && sanitized.responseTime.length > 80) {
    return fail(res, "responseTime must be 80 characters or less");
  }

  if (body.returnRate !== undefined && sanitized.returnRate.length > 80) {
    return fail(res, "returnRate must be 80 characters or less");
  }

  if (
    body.avatar !== undefined &&
    sanitized.avatar &&
    !/^https?:\/\//i.test(sanitized.avatar)
  ) {
    return fail(res, "avatar must be a valid URL");
  }

  if (body.specialties !== undefined) {
    if (!Array.isArray(body.specialties)) {
      return fail(res, "specialties must be an array of strings");
    }
    sanitized.specialties = body.specialties
      .map((item) => trimmedString(item))
      .filter(Boolean);
  }

  if (body.certifications !== undefined) {
    if (!Array.isArray(body.certifications)) {
      return fail(res, "certifications must be an array of strings");
    }
    sanitized.certifications = body.certifications
      .map((item) => trimmedString(item))
      .filter(Boolean);
  }

  const numericFields = [
    "yearsInBusiness",
    "totalOrders",
    "totalReviews",
    "averageRating",
  ];

  for (const field of numericFields) {
    if (body[field] !== undefined) {
      const value = Number(body[field]);
      if (!Number.isFinite(value)) {
        return fail(res, `${field} must be a valid number`);
      }
      sanitized[field] = value;
    }
  }

  if (
    sanitized.yearsInBusiness !== undefined &&
    sanitized.yearsInBusiness < 0
  ) {
    return fail(res, "yearsInBusiness must be zero or more");
  }

  if (sanitized.totalOrders !== undefined && sanitized.totalOrders < 0) {
    return fail(res, "totalOrders must be zero or more");
  }

  if (sanitized.totalReviews !== undefined && sanitized.totalReviews < 0) {
    return fail(res, "totalReviews must be zero or more");
  }

  if (
    sanitized.averageRating !== undefined &&
    (sanitized.averageRating < 0 || sanitized.averageRating > 5)
  ) {
    return fail(res, "averageRating must be between 0 and 5");
  }

  req.body = sanitized;
  return next();
};

const validateAddressRequest = (req, res, next) => {
  const label = trimmedString(req.body?.label);
  const street = trimmedString(req.body?.street);
  const city = trimmedString(req.body?.city);
  const state = trimmedString(req.body?.state);
  const pincode = trimmedString(req.body?.pincode);
  const isDefault = req.body?.isDefault;

  if (!street || !city || !state || !pincode) {
    return fail(res, "street, city, state and pincode are required");
  }

  if (
    pincode.length < 4 ||
    pincode.length > 10 ||
    !/^[0-9A-Za-z\-\s]+$/.test(pincode)
  ) {
    return fail(res, "pincode has an invalid format");
  }

  req.body = {
    ...req.body,
    label: label || "Home",
    street,
    city,
    state,
    pincode,
    isDefault: isDefault === true || isDefault === "true",
  };

  return next();
};

const validatePaymentMethodRequest = (req, res, next) => {
  const type = trimmedString(req.body?.type) || "upi";
  const label = trimmedString(req.body?.label);
  const details = trimmedString(req.body?.details);
  const isDefault = req.body?.isDefault;

  if (!label || label.length > 60) {
    return fail(res, "label is required and must be 60 characters or less");
  }

  if (!details || details.length > 200) {
    return fail(res, "details is required and must be 200 characters or less");
  }

  if (!["card", "upi"].includes(type)) {
    return fail(res, "type must be either card or upi");
  }

  req.body = {
    ...req.body,
    type,
    label,
    details,
    isDefault: isDefault === true || isDefault === "true",
  };

  return next();
};

const validateProductCreateRequest = (req, res, next) => {
  const name = trimmedString(req.body?.name);
  const description = trimmedString(req.body?.description);
  const originPlace = trimmedString(req.body?.originPlace);
  const price = Number(req.body?.price);

  if (!name || name.length > 120) {
    return fail(res, "name is required and must be 120 characters or less");
  }

  if (!description || description.length > 5000) {
    return fail(
      res,
      "description is required and must be 5000 characters or less",
    );
  }

  if (!originPlace || originPlace.length > 120) {
    return fail(
      res,
      "originPlace is required and must be 120 characters or less",
    );
  }

  if (!isPositiveNumber(price)) {
    return fail(res, "price must be a positive number");
  }

  req.body = { ...req.body, name, description, originPlace, price };
  return next();
};

const validateProductUpdateRequest = (req, res, next) => {
  const body = req.body || {};
  const sanitized = { ...body };
  const allowedFields = ["name", "description", "price", "originPlace"];
  const hasBodyUpdate = allowedFields.some(
    (field) => body[field] !== undefined,
  );
  const hasFiles = Array.isArray(req.files) ? req.files.length > 0 : false;

  if (!hasBodyUpdate && !hasFiles) {
    return fail(
      res,
      "Please provide at least one field to update or upload images",
    );
  }

  if (body.name !== undefined) {
    const name = trimmedString(body.name);
    if (!name || name.length > 120) {
      return fail(res, "name must be 1 to 120 characters long");
    }
    sanitized.name = name;
  }

  if (body.description !== undefined) {
    const description = trimmedString(body.description);
    if (!description || description.length > 5000) {
      return fail(res, "description must be 1 to 5000 characters long");
    }
    sanitized.description = description;
  }

  if (body.originPlace !== undefined) {
    const originPlace = trimmedString(body.originPlace);
    if (!originPlace || originPlace.length > 120) {
      return fail(res, "originPlace must be 1 to 120 characters long");
    }
    sanitized.originPlace = originPlace;
  }

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!isPositiveNumber(price)) {
      return fail(res, "price must be a positive number");
    }
    sanitized.price = price;
  }

  req.body = sanitized;
  return next();
};

const validateReviewRequest = (req, res, next) => {
  const rating = Number(req.body?.rating);
  const comment = trimmedString(req.body?.comment);

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return fail(res, "Rating must be between 1 and 5");
  }

  if (comment.length > 1000) {
    return fail(res, "comment must be 1000 characters or less");
  }

  req.body = { ...req.body, rating, comment };
  return next();
};

const validateOrderCreateRequest = (req, res, next) => {
  const productId = trimmedString(req.body?.productId);
  const quantity = Number(req.body?.quantity ?? 1);
  const shippingAddress = req.body?.shippingAddress;

  if (!isObjectId(productId)) {
    return fail(res, "productId must be a valid id");
  }

  if (!isPositiveInteger(quantity)) {
    return fail(res, "quantity must be a positive integer");
  }

  if (!isPlainObject(shippingAddress)) {
    return fail(res, "shippingAddress must be an object");
  }

  const street = trimmedString(shippingAddress.street);
  const city = trimmedString(shippingAddress.city);
  const state = trimmedString(shippingAddress.state);
  const pincode = trimmedString(shippingAddress.pincode);

  if (!street || !city || !state || !pincode) {
    return fail(
      res,
      "shippingAddress.street, city, state and pincode are required",
    );
  }

  if (
    pincode.length < 4 ||
    pincode.length > 10 ||
    !/^[0-9A-Za-z\-\s]+$/.test(pincode)
  ) {
    return fail(res, "shippingAddress.pincode has an invalid format");
  }

  req.body = {
    ...req.body,
    productId,
    quantity,
    shippingAddress: { street, city, state, pincode },
  };

  return next();
};

const validatePaymentVerificationRequest = (req, res, next) => {
  const razorpay_order_id = trimmedString(req.body?.razorpay_order_id);
  const razorpay_payment_id = trimmedString(req.body?.razorpay_payment_id);
  const razorpay_signature = trimmedString(req.body?.razorpay_signature);

  if (!razorpay_order_id) {
    return fail(res, "razorpay_order_id is required");
  }

  req.body = {
    ...req.body,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };

  return next();
};

const validateRefundCreateRequest = (req, res, next) => {
  const orderId = trimmedString(req.body?.orderId);
  const reason = trimmedString(req.body?.reason);

  if (!isObjectId(orderId)) {
    return fail(res, "orderId must be a valid id");
  }

  if (!reason || reason.length > 500) {
    return fail(res, "reason is required and must be 500 characters or less");
  }

  req.body = { ...req.body, orderId, reason };
  return next();
};

const validateRefundDecisionRequest = (req, res, next) => {
  const status = trimmedString(req.body?.status);
  const adminReason = trimmedString(req.body?.adminReason);

  if (!["Approved", "Rejected"].includes(status)) {
    return fail(res, "status must be Approved or Rejected");
  }

  if (adminReason.length > 500) {
    return fail(res, "adminReason must be 500 characters or less");
  }

  req.body = { ...req.body, status, adminReason };
  return next();
};

const validateSellerRefundResponseRequest = (req, res, next) => {
  const sellerResponse = trimmedString(req.body?.sellerResponse);

  if (!sellerResponse) {
    return fail(res, "sellerResponse is required");
  }

  if (sellerResponse.length > 1000) {
    return fail(res, "sellerResponse must be 1000 characters or less");
  }

  req.body = { ...req.body, sellerResponse };
  return next();
};

const validateSellerRefundDecisionRequest = (req, res, next) => {
  const status = trimmedString(req.body?.status);

  if (!["Accepted", "Rejected"].includes(status)) {
    return fail(res, "status must be Accepted or Rejected");
  }

  req.body = { ...req.body, status };
  return next();
};

const validateSellerDecisionRequest = (req, res, next) => {
  const status = trimmedString(req.body?.status);
  const adminComments = trimmedString(req.body?.adminComments);
  const rejectionReason = trimmedString(req.body?.rejectionReason);

  if (!["approved", "rejected"].includes(status)) {
    return fail(res, "status must be approved or rejected");
  }

  if (adminComments.length > 1000) {
    return fail(res, "adminComments must be 1000 characters or less");
  }

  if (rejectionReason.length > 1000) {
    return fail(res, "rejectionReason must be 1000 characters or less");
  }

  if (status === "rejected" && !rejectionReason) {
    return fail(res, "rejectionReason is required when rejecting a seller");
  }

  req.body = { ...req.body, status, adminComments, rejectionReason };
  return next();
};

const validateComplianceDocDecisionRequest = (req, res, next) => {
  const status = trimmedString(req.body?.status);
  const docType = trimmedString(req.body?.docType);
  const adminComments = trimmedString(req.body?.adminComments);
  const rejectionReason = trimmedString(req.body?.rejectionReason);

  if (!["gstCertificate", "businessLicense"].includes(docType)) {
    return fail(res, "docType must be gstCertificate or businessLicense");
  }

  if (!["approved", "rejected"].includes(status)) {
    return fail(res, "status must be approved or rejected");
  }

  if (adminComments.length > 1000) {
    return fail(res, "adminComments must be 1000 characters or less");
  }

  if (rejectionReason.length > 1000) {
    return fail(res, "rejectionReason must be 1000 characters or less");
  }

  if (status === "rejected" && !rejectionReason) {
    return fail(
      res,
      "rejectionReason is required when rejecting a compliance document",
    );
  }

  req.body = { status, docType, adminComments, rejectionReason };
  return next();
};

const validateFilePresence = (fieldLabel) => (req, res, next) => {
  if (!req.file && !req.files) {
    return fail(res, `${fieldLabel} is required`);
  }
  return next();
};

module.exports = {
  validateObjectIdParam,
  validateRegisterRequest,
  validateEmailBody,
  validateResetPasswordRequest,
  validateLoginRequest,
  validateLoginTwoFactorVerifyRequest,
  validateLoginTwoFactorResendRequest,
  validateDeleteAccountOtpConfirmRequest,
  validateProfileUpdateRequest,
  validateAddressRequest,
  validatePaymentMethodRequest,
  validateProductCreateRequest,
  validateProductUpdateRequest,
  validateReviewRequest,
  validateOrderCreateRequest,
  validatePaymentVerificationRequest,
  validateRefundCreateRequest,
  validateRefundDecisionRequest,
  validateSellerRefundResponseRequest,
  validateSellerRefundDecisionRequest,
  validateSellerDecisionRequest,
  validateComplianceDocDecisionRequest,
  validateFilePresence,
};
