const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/userModel");
const SenderEmail = require("../models/senderEmailModel");

const { sendEmail } = require("../../aws_run1");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ status: 400, msg: "User already exists" });
    }

    user = new User({ email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    // send email with OTP
    await sendEmail(
      email,
      "Registrtion verification OTP",
      "Your otp is " + otp
    );

    console.log("OTP is: ", otp);

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.jwt_secret,
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ status: 200, token: token, user: user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ status: 400, msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: 400, msg: "Invalid Credentials" });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.jwt_secret,
      { expiresIn: 360000 },
      async (err, token) => {
        if (err) throw err;

        // If user is not verified
        if (!user.isVerified) {
          // generate OTP
          const otp = crypto.randomInt(100000, 999999).toString();
          const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

          user.otp = otp;
          user.otpExpiry = otpExpiry;

          await user.save();

          // send email with OTP
          // await sendEmail(email, "verification OTP", "Your otp is " + otp);

          console.log("OTP is: ", otp);
          return res.json({ status: 401, token: token, user: user });
        }
        res.json({ status: 200, token: token, user: user });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.validateToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res
      .status(200)
      .json({ status: 401, message: "Please provide the token" }); // No token provided
  }

  jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(200).json({ status: 401, message: "Token expired" }); // Token expired
      }
      return res.status(200).json({ status: 401, message: "Invalid token" }); // Invalid token
    }

    const user = await User.findOne({ _id: decoded.user.id });

    res.json({ status: 200, message: "valid token", user: user });
  });
};

exports.verifyRegisterOtp = async (req, res) => {
  const { token, otp } = req.body;

  if (!token || !otp) {
    return res
      .status(200)
      .json({ status: 403, message: "Please provide required values" }); // No token provided
  }

  jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(200).json({ status: 401, message: "Token expired" }); // Token expired
      }
      return res.status(200).json({ status: 401, message: "Invalid token" }); // Invalid token
    }

    let user = await User.findOne({ _id: decoded.user.id });

    if (user.otpExpiry < Date.now()) {
      return res.json({ status: 404, message: "OTP is Expired" });
    }

    if (user.otp === otp) {
      user.isVerified = true;
      user.save();

      res.json({ status: 200, message: "User verified." });
    } else {
      res.json({ status: 402, message: "Invalid OTP" });
    }
  });
};

exports.savePersonalInfo = async (req, res) => {
  const { firstName, lastName, companyName, websiteUrl } = req.body;

  try {
    let user = await User.findOne({ _id: req.user.id });

    user.firstName = firstName;
    user.lastName = lastName;
    user.companyName = companyName;
    user.websiteUrl = websiteUrl;
    user.save();

    const senderemail = new SenderEmail({
      user: user._id,
      name: user.firstName + " " + user.lastName,
      email: user.email,
      isVerified: true,
      isAdmin: true,
    });

    await senderemail.save();

    res.json({ status: 200, message: "User updates.", user: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Reset password Routes
exports.requestResetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ status: 404, message: "User not found" });
  }

  // generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  user.otp = otp;
  user.otpExpiry = otpExpiry;

  await user.save();

  // send email with OTP
  await sendEmail(email, "Reset verification OTP", "Your otp is " + otp);

  // console.log("OTP is: ", otp);

  const payload = { user: { id: user.id } };
  jwt.sign(
    payload,
    process.env.jwt_secret,
    { expiresIn: 360000 },
    (err, token) => {
      if (err) throw err;
      res.json({
        status: 200,
        token: token,
        user: user,
        message: "OTP sent to your email",
      });
    }
  );
};

exports.verifyResetPasswordOtp = async (req, res) => {
  const { token, otp } = req.body;

  if (!token || !otp) {
    return res
      .status(200)
      .json({ status: 403, message: "Please provide required values" }); // No token provided
  }

  jwt.verify(token, process.env.jwt_secret, async (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(200).json({ status: 401, message: "Token expired" }); // Token expired
      }
      return res.status(200).json({ status: 401, message: "Invalid token" }); // Invalid token
    }

    let user = await User.findOne({ _id: decoded.user.id });

    if (user.otpExpiry < Date.now()) {
      return res.json({ status: 404, message: "OTP is Expired" });
    }

    if (user.otp === otp) {
      user.isVerified = true;
      user.save();

      res.json({ status: 200, message: "User verified." });
    } else {
      res.json({ status: 402, message: "Invalid OTP" });
    }
  });
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;

  try {
    let user = await User.findOne({ _id: req.user.id });

    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt);
    user.save();

    res.json({ status: 200, message: "User updates.", user: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
