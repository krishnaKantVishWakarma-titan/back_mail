const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  companyName: { type: String },
  websiteUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  tags: [
    {
      type: String, // Array of tags
      default: [],
    },
  ],
  subscriptionPlan: {
    type: String,
    enum: ["free", "basic", "premium"],
    default: "free",
  },
  totalNoOfContacts: {
    type: Number,
  },
});

module.exports = mongoose.model("User", UserSchema);
