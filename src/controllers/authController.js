const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.register = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.json({ status: 400, msg: "User already exists" });
    }

    user = new User({ email, password, fullName });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

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
