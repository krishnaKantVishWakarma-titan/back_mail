const express = require("express");
const {
  register,
  login,
  validateToken,
  verifyRegisterOtp,
  savePersonalInfo,
  requestResetPassword,
  verifyResetPasswordOtp,
  resetPassword,
} = require("../controllers/authController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/validateToken", validateToken);

// Registeration Routes
router.post("/register", register);
router.post("/verifyRegisterOtp", verifyRegisterOtp);
router.post("/savePersonalInfo", auth, savePersonalInfo);

// Reset password Routes
router.post("/requestResetPassword", requestResetPassword);
router.post("/verifyResetPasswordOtp", verifyResetPasswordOtp);
router.post("/resetPassword", auth, resetPassword);

module.exports = router;
