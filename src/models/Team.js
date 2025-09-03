const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, unique: true },
    regNumber: { type: String, required: true, unique: true },
    teamHead: { type: String, required: true },
    password: { type: String, required: true },
    // New field to track login sessions
    tokenVersion: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    currentStage: { type: String, default: 'instructions', enum: ['instructions', 'set1', 'score', 'feedback', 'done'] },
    contestStartedAt: { type: Date },
    timeTakenMs: { type: Number, default: 0 },
    submittedAt: { type: Date },
    violations: { type: Number, default: 0 },
    cheated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// The pre-save hook that set password = teamName has been removed.

// Method to validate login
teamSchema.methods.isValidPassword = function (inputPassword) {
  return this.password === inputPassword;
};

module.exports = mongoose.model("Team", teamSchema);
