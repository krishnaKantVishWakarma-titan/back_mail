const User = require("../models/userModel");
const SenderEmail = require("../models/senderEmailModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../../aws_run1");

exports.updateUserDataById = async (req, res) => {
  const { payload } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      {
        $set: payload,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Sender Emails
/*
Get All Sender emails by user id
Add Single Sender email
Verify sender email
remove sender
*/

exports.getAllSenderEmailById = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  try {
    const senderEmail = await SenderEmail.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SenderEmail.countDocuments({ user: userId });

    res.status(200).json({ data: senderEmail, total: total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.deleteSenderEmailById = async (req, res) => {
  const { senderEmailId } = req.body;
  const userId = req.user.id;
  const page = 1;
  const limit = 10;
  try {
    await SenderEmail.deleteOne({ _id: senderEmailId });

    const data = await SenderEmail.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await SenderEmail.countDocuments({ user: userId });

    res.status(200).json({ data, total });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.addSenderEmailAddress = async (req, res) => {
  const { payload } = req.body;
  const userId = req.user.id;

  try {
    let senderEmail = await SenderEmail.findOne({
      user: userId,
      email: payload.email,
    });

    if (senderEmail) {
      return res.json({ status: 400, msg: "Email Already Exists" });
    }

    senderEmail = new SenderEmail({
      user: userId,
      name: payload.name,
      email: payload.email,
    });

    await senderEmail.save();

    // generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    const user = await User.findOne({ _id: userId });
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // send email with OTP
    // await sendEmail(email, "For Add new sender email", "Your otp is " + otp);
    console.log("otp is : ", otp);

    res.status(200).json({ status: 200, msg: "Email added" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.verifyOtpSenderEmail = async (req, res) => {
  const { payload } = req.body;
  const userId = req.user.id;

  try {
    let user = await User.findOne({ _id: userId });

    if (user.otpExpiry < Date.now()) {
      return res.json({ status: 404, message: "OTP is Expired" });
    }

    if (user.otp === payload.otp) {
      let senderEmail = await SenderEmail.findOne({
        user: userId,
        email: payload.email,
      });
      senderEmail.isVerified = true;

      await senderEmail.save();
      res.status(200).json({ status: 200, message: "Email verified" });
    } else {
      res.json({ status: 402, message: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
