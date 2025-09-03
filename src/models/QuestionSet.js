 // models/QuestionSet.js

const mongoose = require('mongoose');

const QSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ['fill_blank'], default: 'fill_blank' }
},{ _id:false });

const QuestionSetSchema = new mongoose.Schema({
  setNumber: { type: Number, min: 1, max: 50, unique: true, required: true },
  question: { type: QSchema, required: true },
  answer: { type: String, required: true },
  active: { type: Boolean, default: true }
},{ timestamps:true });

module.exports = mongoose.model('QuestionSet', QuestionSetSchema);