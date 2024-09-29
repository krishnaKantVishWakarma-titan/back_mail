const mongoose = require("mongoose");
const { Schema } = mongoose;

const ContactSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String },
  email: { type: String, required: true, unique: false }, // unique: false since we are handling duplicates manually
  subscribed: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  tags: [
    {
      type: String, // Array of tags
      default: [],
    },
  ],
});

ContactSchema.index({ email: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Contact", ContactSchema);
