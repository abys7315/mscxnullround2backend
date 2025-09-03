// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Team = require('./src/models/Team');
const QuestionSet = require('./src/models/QuestionSet');
const Submission = require('./src/models/Submission');
const Feedback = require('./src/models/Feedback');

const questionSets = [];

// Generate 50 fill-in-the-blanks questions
for (let i = 1; i <= 50; i++) {
  questionSets.push({
    setNumber: i,
    question: {
      title: `Fill in the Blank Question ${i}`,
      description: `This is a fill-in-the-blanks question number ${i}. The answer is a word or phrase that fits the blank. For example: The capital of France is _____. (Enter your answer)`,
      type: 'fill_blank'
    },
    answer: `answer${i}`,
    active: true
  });
}

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await Team.deleteMany({});
    await QuestionSet.deleteMany({});
    await Submission.deleteMany({});
    await Feedback.deleteMany({});
    console.log('Cleared existing data.');

    // Insert new questions
    await QuestionSet.insertMany(questionSets);
    console.log('Question sets have been seeded.');

  } catch (err) {
    console.warn('Error seeding:', err);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seed();
