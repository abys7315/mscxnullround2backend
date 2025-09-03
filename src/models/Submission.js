const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  setNumber: { type: Number, min: 1, max: 50, required: true },
  answers: {
    fill_blank: { type: String, required: true }
  },
  serverReceivedAt: { type: Date, required: true },
  accepted: { type: Boolean, default: false }
}, { timestamps:true });
SubmissionSchema.index({ teamId: 1, setNumber: 1 }, { unique: true });
module.exports = mongoose.model('Submission', SubmissionSchema);
