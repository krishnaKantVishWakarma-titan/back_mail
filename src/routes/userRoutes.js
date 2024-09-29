const express = require("express");
const {
  updateUserDataById,
  addSenderEmailAddress,
  verifyOtpSenderEmail,
  getAllSenderEmailById,
  deleteSenderEmailById,
} = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

// User
router.put("/updateUserDataById", auth, updateUserDataById);

// Sender email
router.put("/addSenderEmailAddress", auth, addSenderEmailAddress);
router.put("/verifyOtpSenderEmail", auth, verifyOtpSenderEmail);
router.get("/getAllSenderEmailById", auth, getAllSenderEmailById);
router.post("/deleteSenderEmailById", auth, deleteSenderEmailById);

module.exports = router;
