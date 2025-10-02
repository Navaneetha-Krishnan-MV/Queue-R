const express = require('express');
const Question = require('../models/Question');
const Team = require('../models/Team');
const Answer = require('../models/Answer');
const QRGenerator = require('../utils/qrGenerator');
const { validateQuestionUpload } = require('../middleware/validation');
const router = express.Router();

// Upload questions
router.post('/questions', validateQuestionUpload, async (req, res) => {
  try {
    const { questions } = req.body;

    // Clear existing questions (optional - remove if you want to keep existing)
    await Question.deleteMany({});

    // Process and save new questions
    const questionsToSave = questions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      correctAnswer: q.correctAnswer,
      points: q.points || 10,
      qrToken: QRGenerator.generateToken(),
      isAnswered: false,
      answeredBy: null,
      answeredAt: null,
      isActive: true
    }));

    const savedQuestions = await Question.insertMany(questionsToSave);

    res.json({ 
      message: `${questions.length} questions uploaded successfully`,
      count: questions.length,
      questions: savedQuestions.map(q => ({
        id: q._id,
        questionId: q.questionId,
        questionText: q.questionText,
        points: q.points
      }))
    });
  } catch (error) {
    console.error('Question upload error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Generate QR codes for all questions
router.post('/generate-qr-codes', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true }).sort({ questionId: 1 });
    
    if (questions.length === 0) {
      return res.status(400).json({ 
        message: 'No questions found. Upload questions first.' 
      });
    }

    // Generate QR codes using the existing tokens
    const qrCodes = await QRGenerator.generateBulkQRCodes(questions);

    res.json({
      message: 'QR codes generated successfully',
      count: qrCodes.length,
      qrCodes
    });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get all questions for admin dashboard
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .populate('answeredBy', 'teamName leaderName')
      .sort({ questionId: 1 });

    const questionsData = questions.map(q => ({
      id: q._id,
      questionId: q.questionId,
      questionText: q.questionText,
      correctAnswer: q.correctAnswer,
      points: q.points,
      isAnswered: q.isAnswered,
      answeredBy: q.answeredBy ? {
        teamName: q.answeredBy.teamName,
        leaderName: q.answeredBy.leaderName
      } : null,
      answeredAt: q.answeredAt,
      qrToken: q.qrToken
    }));

    res.json(questionsData);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get event statistics for admin dashboard
router.get('/stats', async (req, res) => {
  try {
    const [totalQuestions, answeredQuestions, totalTeams, totalAnswers] = await Promise.all([
      Question.countDocuments({ isActive: true }),
      Question.countDocuments({ isAnswered: true }),
      Team.countDocuments({ isActive: true }),
      Answer.countDocuments({})
    ]);

    const correctAnswers = await Answer.countDocuments({ isCorrect: true });
    const incorrectAnswers = totalAnswers - correctAnswers;

    // Get top performing teams
    const topTeams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1 })
      .limit(5)
      .select('teamName totalPoints');

    // Get recent activity
    const recentAnswers = await Answer.find({})
      .populate('teamId', 'teamName')
      .populate('questionId', 'questionId questionText')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalQuestions,
      answeredQuestions,
      remainingQuestions: totalQuestions - answeredQuestions,
      totalTeams,
      totalAnswers,
      correctAnswers,
      incorrectAnswers,
      accuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      topTeams,
      recentActivity: recentAnswers.map(a => ({
        teamName: a.teamId?.teamName || 'Unknown',
        questionId: a.questionId?.questionId || 'N/A',
        questionText: a.questionId?.questionText || 'N/A',
        isCorrect: a.isCorrect,
        pointsAwarded: a.pointsAwarded,
        submittedAt: a.createdAt
      }))
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Reset event (clear all data) - USE WITH CAUTION
router.post('/reset-event', async (req, res) => {
  try {
    // Clear all answers
    await Answer.deleteMany({});
    
    // Reset all questions
    await Question.updateMany(
      { isActive: true },
      { 
        isAnswered: false, 
        answeredBy: null, 
        answeredAt: null 
      }
    );
    
    // Reset all team points
    await Team.updateMany(
      { isActive: true },
      { totalPoints: 0 }
    );

    // Emit leaderboard update
    req.io?.to('leaderboard').emit('leaderboard-update');

    res.json({
      message: 'Event reset successfully. All questions are now available and team scores reset to 0.'
    });
  } catch (error) {
    console.error('Reset event error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete a specific question
router.delete('/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Delete related answers
    await Answer.deleteMany({ questionId: question._id });

    // Delete the question
    await Question.findByIdAndDelete(questionId);

    res.json({ 
      message: 'Question deleted successfully' 
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update a specific question
router.put('/questions/:questionId', async (req, res) => {
  try {
    const { questionId } = req.params;
    const { questionText, correctAnswer, points } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Don't allow editing if already answered
    if (question.isAnswered) {
      return res.status(400).json({ 
        message: 'Cannot edit question that has already been answered' 
      });
    }

    // Update question
    question.questionText = questionText || question.questionText;
    question.correctAnswer = correctAnswer || question.correctAnswer;
    question.points = points || question.points;

    await question.save();

    res.json({ 
      message: 'Question updated successfully',
      question: {
        id: question._id,
        questionId: question.questionId,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        points: question.points
      }
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get all teams for admin
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 })
      .select('teamName leaderName email totalPoints createdAt');

    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;