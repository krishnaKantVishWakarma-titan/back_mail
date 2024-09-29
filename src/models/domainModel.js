const mongoose = require("mongoose");
const { Schema } = mongoose;

const DomainSchema = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String },
  verificationStatus: { type: String, default: "Pending" },
  dnsRecords: [
    {
      type: { type: String },
      name: String,
      value: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Domain", DomainSchema);
