const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'pending' },
  emailObj: {type: Schema.Types.Mixed},
  response: {type: Schema.Types.Mixed},
  result: { type: String },
  isScheduled: { type: Boolean, default: false },
  scheduledDate: { type: Date, default: null }
});

module.exports = mongoose.model('Task', TaskSchema);
