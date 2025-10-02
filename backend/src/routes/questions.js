const express = require('express');
const Question = require('../models/Question');
const Team = require('../models/Team');
const Answer = require('../models/Answer');
const router = express.Router();

// Get question by ID and token
router.get('/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const question = await Question.findOne({
      questionId: parseInt(questionId),
      qrToken: token,
      isActive: true
    });

    if (!question) {
      return res.status(404).json({ 
        message: 'Question not found or QR code has expired' 
      });
    }

    if (question.isAnswered) {
      return res.status(410).json({ 
        message: 'This question has already been answered by another team' 
      });
    }

    res.json({
      questionId: question.questionId,
      questionText: question.questionText,
      points: question.points,
      token: question.qrToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit answer
router.post('/:questionId/answer', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { teamId, answer, token } = req.body;

    // Validate inputs
    if (!teamId || !answer || !token) {
      return res.status(400).json({ 
        message: 'Team ID, answer, and token are required' 
      });
    }

    // Find question and validate token
    const question = await Question.findOne({
      questionId: parseInt(questionId),
      qrToken: token,
      isActive: true
    });

    if (!question) {
      return res.status(404).json({ 
        message: 'Question not found or invalid token' 
      });
    }

    // Check if question is already answered
    if (question.isAnswered) {
      return res.status(410).json({ 
        message: 'This question has already been answered by another team' 
      });
    }

    // Find team
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if this team has already attempted this question
    const existingAnswer = await Answer.findOne({
      teamId,
      questionId: question._id
    });

    if (existingAnswer) {
      return res.status(400).json({ 
        message: 'Team has already attempted this question' 
      });
    }

    // Check answer correctness
    const isCorrect = answer.toLowerCase().trim() === 
                     question.correctAnswer.toLowerCase().trim();
    
    const pointsAwarded = isCorrect ? question.points : 0;

    // Create answer record
    const answerRecord = new Answer({
      teamId,
      questionId: question._id,
      submittedAnswer: answer,
      isCorrect,
      pointsAwarded
    });

    await answerRecord.save();

    if (isCorrect) {
      // Mark question as answered
      question.isAnswered = true;
      question.answeredBy = teamId;
      question.answeredAt = new Date();
      await question.save();

      // Update team points
      team.totalPoints += pointsAwarded;
      await team.save();

      // Emit leaderboard update via socket
      req.io.to('leaderboard').emit('leaderboard-update');

      res.json({
        message: 'Correct answer! Points awarded.',
        isCorrect: true,
        pointsAwarded,
        teamTotalPoints: team.totalPoints
      });
    } else {
      res.json({
        message: 'Incorrect answer. No points awarded.',
        isCorrect: false,
        pointsAwarded: 0,
        correctAnswer: question.correctAnswer
      });
    }
  } catch (error) {
    console.error('Answer submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;