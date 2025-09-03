const mongoose = require('mongoose');
const FeedbackSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  text: { type: String, required: true },
  serverReceivedAt: { type: Date, required: true }
}, { timestamps:true });
module.exports = mongoose.model('Feedback', FeedbackSchema);
