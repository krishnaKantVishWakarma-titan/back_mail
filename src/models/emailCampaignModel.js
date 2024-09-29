const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmailCampaignSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
  },
  content: {
    type: String,
  },
  editorType: {
    type: String, // richTextEditor or dragAndDropEditor
    default: "",
  },
  sendToContactType: {
    type: String, // sent to selected tags, don't sent to selected tags or sent to all contacts
  },
  senderName: {
    type: String,
  },
  senderEmail: {
    type: String,
  },
  recipients: [
    {
      type: String, // Array of email addresses
    },
  ],
  scheduledTime: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["draft", "scheduled", "sent", "failed"],
    default: "draft",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  sentAt: {
    type: Date,
    required: false,
  },
  totalSent: {
    type: Number,
    default: 0,
  },
  totalOpened: {
    type: Number,
    default: 0,
  },
  totalClicked: {
    type: Number,
    default: 0,
  },
  totalBounced: {
    type: Number,
    default: 0,
  },
  attachments: [
    {
      fileName: String,
      fileUrl: String,
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
});

const EmailCampaign = mongoose.model("EmailCampaign", EmailCampaignSchema);

module.exports = EmailCampaign;
