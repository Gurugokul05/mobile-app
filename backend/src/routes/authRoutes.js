const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getSavedAddresses,
  addSavedAddress,
  deleteSavedAddress,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  deleteMyAccount,
} = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router
  .route("/addresses")
  .get(protect, getSavedAddresses)
  .post(protect, addSavedAddress);
router.delete("/addresses/:addressId", protect, deleteSavedAddress);
router
  .route("/payment-methods")
  .get(protect, getPaymentMethods)
  .post(protect, addPaymentMethod);
router.delete("/payment-methods/:methodId", protect, deletePaymentMethod);
router.delete("/me", protect, deleteMyAccount);

module.exports = router;
