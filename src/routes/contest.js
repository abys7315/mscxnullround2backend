const express = require('express');
const { auth } = require('../middleware/auth.js');
const QuestionSet = require('../models/QuestionSet.js');
const Submission = require('../models/Submission.js');
const Feedback = require('../models/Feedback.js');
const Team = require('../models/Team.js'); // Make sure to import Team model

const router = express.Router();
router.use(auth);

// GET /api/contest/state
router.get('/state', (req, res) => res.json({ currentStage: req.team.currentStage }));

// POST /api/contest/start
router.post('/start', async (req, res) => {
  try {
    if (req.team.currentStage === 'instructions') {
      req.team.currentStage = 'set1';
      req.team.contestStartedAt = new Date();
      await req.team.save();
      return res.json({ status: 'ok', newStage: 'set1' });
    }
    return res.json({ status: 'already_started', currentStage: req.team.currentStage });
  } catch (err) {
    console.error("Error starting contest:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/contest/questions
router.get('/questions', async (req, res) => {
  if (req.team.currentStage !== 'set1') return res.status(403).json({ error: 'Questions not available' });

  const questions = await QuestionSet.find({ active: true }, { __v: 0, answer: 0, passkey: 0 }).sort({ setNumber: 1 });
  if (!questions || questions.length === 0) return res.status(404).json({ error: 'Questions not found' });
  res.json(questions);
});

// POST /api/contest/submissions
router.post('/submissions', async (req, res) => {
  try {
    console.log('Submission request received:', req.body);
    const { answers, confirmation } = req.body; // answers is an object like {1: 'answer1', 2: 'answer2', ...}, confirmation is a string

    if (!answers || typeof answers !== 'object') {
      console.log('Invalid answers format:', answers);
      return res.status(400).json({ error: 'Answers required' });
    }

    if (!confirmation || typeof confirmation !== 'string') {
      console.log('Invalid confirmation format:', confirmation);
      return res.status(400).json({ error: 'Confirmation required' });
    }

    if (req.team.currentStage !== 'set1') {
      console.log('Invalid stage:', req.team.currentStage);
      return res.status(403).json({ error: 'Submission not available' });
    }

    const exists = await Submission.findOne({ teamId: req.team._id });
    if (exists) {
      console.log('Already submitted for team:', req.team._id);
      return res.status(409).json({ error: 'Already submitted' });
    }

    // Validate the confirmation by checking if it equals 'end'
    if (confirmation.toLowerCase() !== 'end') {
      console.log('Invalid submission confirmation:', confirmation);
      return res.status(403).json({ error: 'Invalid confirmation' });
    }

    let totalScore = 0;
    const submissions = [];

    for (let setNumber = 1; setNumber <= 50; setNumber++) {
      const answer = answers[setNumber]?.trim();
      if (!answer) continue; // skip if no answer

      const qs = await QuestionSet.findOne({ setNumber, active: true });
      if (!qs) {
        console.log('Question not found:', setNumber);
        continue;
      }

      let scoreForThisSet = 0;
      if (answer.toLowerCase() === qs.answer.toLowerCase()) {
        scoreForThisSet += 2; // 2 points per question, 100 total
      }

      submissions.push({
        teamId: req.team._id,
        setNumber,
        answers: { fill_blank: answer },
        serverReceivedAt: new Date(),
        accepted: true
      });

      totalScore += scoreForThisSet;
    }

    console.log('Inserting submissions:', submissions.length);
    await Submission.insertMany(submissions);

    req.team.score = totalScore;
    req.team.currentStage = 'score';
    req.team.timeTakenMs = Date.now() - req.team.contestStartedAt.getTime();
    req.team.submittedAt = new Date();

    await req.team.save();

    console.log('Submission successful, score:', totalScore);
    return res.json({
      status: 'ok',
      accepted: true,
      movedTo: req.team.currentStage,
      scoreAwarded: totalScore
    });
  } catch (err) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// POST /api/contest/score
router.post('/score', async (req, res) => {
  try {
    if (req.team.currentStage !== 'score' && req.team.currentStage !== 'feedback') {
      return res.status(403).json({ error: 'Score page not available' });
    }

    // Fetch number of answered questions
    const answered = await Submission.countDocuments({ teamId: req.team._id });

    // Calculate stats
    const correct = Math.floor(req.team.score / 2); // 2 points per correct answer
    const wrong = answered - correct;
    const unanswered = 50 - answered;

    // Set stage to feedback if not already
    if (req.team.currentStage === 'score') {
      req.team.currentStage = 'feedback';
      await req.team.save();
    }

    return res.json({
      score: req.team.score,
      correct,
      wrong,
      unanswered,
      timeTaken: req.team.timeTakenMs,
      newStage: 'feedback'
    });
  } catch (err) {
    console.error("Error fetching score:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/contest/violation
router.post('/violation', async (req, res) => {
  try {
    req.team.violations += 1;
    if (req.team.violations >= 2) {
      req.team.cheated = true;
    }
    await req.team.save();
    res.json({ violations: req.team.violations, cheated: req.team.cheated });
  } catch (err) {
    console.error("Error recording violation:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/contest/feedback
router.post('/feedback', async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Feedback required' });
  await Feedback.create({ teamId: req.team._id, text: text.trim(), serverReceivedAt: new Date() });
  req.team.currentStage = 'done';
  await req.team.save();
  return res.json({ status: 'ok', logout: true });
});

// Helper functions for time formatting
const formatIST = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }) + ' IST';
};

const formatTimeTaken = (ms) => {
  if (ms === 0 || !ms) return '0m';
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
};

router.get('/leaderboard', async (req, res) => {
  try {
    const teams = await Team.aggregate([
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'teamId',
          as: 'submissions'
        }
      },
      {
        $match: {
          'submissions.0': { $exists: true },
          contestStartedAt: { $exists: true },
          submittedAt: { $exists: true }
        }
      },
      {
        $addFields: {
          timeTakenMs: '$timeTakenMs',
          submittedAt: '$submittedAt'
        }
      },
      {
        $sort: { score: -1, submittedAt: 1 }
      },
      {
        $project: {
          teamName: 1,
          score: 1,
          timeTakenMs: 1,
          submittedAt: 1
        }
      }
    ]);

    // Calculate total submissions, highest, average, and lowest scores
    const stats = await Team.aggregate([
      {
        $match: {
          contestStartedAt: { $exists: true },
          submittedAt: { $exists: true }
        }
      },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          highestScore: { $max: '$score' },
          averageScore: { $avg: '$score' },
          lowestScore: { $min: '$score' }
        }
      }
    ]);

    const formattedTeams = teams.map(team => ({
      _id: team._id,
      teamName: team.teamName,
      score: team.score,
      timeTaken: formatTimeTaken(team.timeTakenMs),
      submittedAt: formatIST(team.submittedAt)
    }));

    res.json({
      stats: stats[0] || { totalSubmissions: 0, highestScore: 0, averageScore: 0, lowestScore: 0 },
      leaderboard: formattedTeams
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
