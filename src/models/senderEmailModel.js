const mongoose = require("mongoose");
const { Schema } = mongoose;

const SenderEmailSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String },
  email: { type: String, required: true, unique: false }, // unique: false since we are handling duplicates manually
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("SenderEmail", SenderEmailSchema);
