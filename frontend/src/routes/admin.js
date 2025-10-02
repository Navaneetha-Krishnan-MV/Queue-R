const express = require('express');
const Question = require('../models/Question');
const QRGenerator = require('../utils/qrGenerator');
const router = express.Router();

// Upload questions
router.post('/questions', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Questions array is required' });
    }

    // Clear existing questions
    await Question.deleteMany({});

    // Process and save new questions
    const questionsToSave = questions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      correctAnswer: q.correctAnswer,
      points: q.points,
      qrToken: QRGenerator.generateToken(),
      isAnswered: false,
      isActive: true
    }));

    await Question.insertMany(questionsToSave);

    res.json({ 
      message: `${questions.length} questions uploaded successfully`,
      count: questions.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate QR codes for all questions
router.post('/generate-qr-codes', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true }).sort({ questionId: 1 });
    
    if (questions.length === 0) {
      return res.status(400).json({ message: 'No questions found. Upload questions first.' });
    }

    const qrCodes = await QRGenerator.generateBulkQRCodes(questions);

    res.json({
      message: 'QR codes generated successfully',
      qrCodes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all questions for admin
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .populate('answeredBy', 'teamName')
      .sort({ questionId: 1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get event statistics
router.get('/stats', async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const answeredQuestions = await Question.countDocuments({ isAnswered: true });
    const totalTeams = await require('../models/Team').countDocuments({ isActive: true });
    
    res.json({
      totalQuestions,
      answeredQuestions,
      remainingQuestions: totalQuestions - answeredQuestions,
      totalTeams
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;