const express = require("express");
const router = express.Router();
const {
  registerUser,
  sendRegisterOtp,
  registerWithOtp,
  sendForgotPasswordOtp,
  resetPasswordWithOtp,
  loginUser,
  verifyLoginTwoFactorOtp,
  resendLoginTwoFactorOtp,
  getUserProfile,
  updateUserProfile,
  getSavedAddresses,
  addSavedAddress,
  deleteSavedAddress,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  deleteMyAccount,
  sendDeleteAccountOtp,
  confirmDeleteMyAccount,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");
const {
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
  validateObjectIdParam,
} = require("../middlewares/validators");
const { createRateLimiter } = require("../middlewares/rateLimiter");

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Please try again later.",
  keyGenerator: (req) =>
    `${req.ip || "unknown"}:${
      String(req.body?.email || "")
        .trim()
        .toLowerCase() || "login"
    }`,
});

const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Please try again later.",
  keyGenerator: (req) =>
    `${req.ip || "unknown"}:${
      String(req.body?.email || "")
        .trim()
        .toLowerCase() || "otp"
    }`,
});

router.post("/register", validateRegisterRequest, registerUser);
router.post("/send-otp", otpLimiter, validateEmailBody, sendRegisterOtp);
router.post(
  "/verify-otp",
  otpLimiter,
  validateRegisterRequest,
  registerWithOtp,
);
router.post(
  "/forgot-password/send-otp",
  otpLimiter,
  validateEmailBody,
  sendForgotPasswordOtp,
);
router.post(
  "/forgot-password/reset",
  otpLimiter,
  validateResetPasswordRequest,
  resetPasswordWithOtp,
);
router.post("/login", loginLimiter, validateLoginRequest, loginUser);
router.post(
  "/login/2fa/verify",
  otpLimiter,
  validateLoginTwoFactorVerifyRequest,
  verifyLoginTwoFactorOtp,
);
router.post(
  "/login/2fa/resend",
  otpLimiter,
  validateLoginTwoFactorResendRequest,
  resendLoginTwoFactorOtp,
);
router.get("/profile", protect, getUserProfile);
router.put(
  "/profile",
  protect,
  validateProfileUpdateRequest,
  updateUserProfile,
);
router
  .route("/addresses")
  .get(protect, getSavedAddresses)
  .post(protect, validateAddressRequest, addSavedAddress);
router.delete(
  "/addresses/:addressId",
  protect,
  validateObjectIdParam("addressId"),
  deleteSavedAddress,
);
router
  .route("/payment-methods")
  .get(protect, getPaymentMethods)
  .post(protect, validatePaymentMethodRequest, addPaymentMethod);
router.delete(
  "/payment-methods/:methodId",
  protect,
  validateObjectIdParam("methodId"),
  deletePaymentMethod,
);
router.post("/me/delete/send-otp", protect, sendDeleteAccountOtp);
router.post(
  "/me/delete/confirm",
  protect,
  validateDeleteAccountOtpConfirmRequest,
  confirmDeleteMyAccount,
);
router.delete("/me", protect, deleteMyAccount);

module.exports = router;
