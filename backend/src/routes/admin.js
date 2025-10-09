const express = require('express');
const db = require('../db/queries');
const QRGenerator = require('../utils/qrGenerator');
const router = express.Router();

// Setup venues (8 venues)
router.post('/venues/setup', async (req, res) => {
  try {
    const venueNames = [
      'Venue A', 'Venue B', 'Venue C', 'Venue D',
      'Venue E', 'Venue F', 'Venue G', 'Venue H'
    ];

    const venues = await db.createVenues(venueNames);

    res.json({
      success: true,
      message: 'Venues created successfully',
      count: venues.length,
      venues: venues.map(v => ({
        id: v.id,
        venueName: v.venue_name,
        isActive: v.is_active
      }))
    });
  } catch (error) {
    console.error('Setup venues error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Upload questions
router.post('/questions', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Questions array is required' 
      });
    }

    // Clear existing data
    await db.deleteAllQuestions();

    // Create questions
    const createdQuestions = await db.createQuestions(questions);

    res.json({
      success: true,
      message: `${createdQuestions.length} questions uploaded successfully`,
      count: createdQuestions.length,
      questions: createdQuestions.map(q => ({
        id: q.id,
        questionText: q.question_text,
        correctOption: q.correct_option,
        basePoints: q.base_points
      }))
    });
  } catch (error) {
    console.error('Upload questions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Assign questions to all venues
router.post('/assign-questions-to-venues', async (req, res) => {
  try {
    const venues = await db.getAllVenues();
    const questions = await db.getAllQuestions();

    if (venues.length === 0 || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please create venues and questions first'
      });
    }

    // Create venue question assignments
    const venueQuestions = [];
    for (const venue of venues) {
      for (const question of questions) {
        venueQuestions.push({
          venueId: venue.id,
          questionId: question.id,
          isActive: true,
          qrToken: QRGenerator.generateToken()
        });
      }
    }

    await db.createVenueQuestions(venueQuestions);

    res.json({
      success: true,
      message: 'Questions assigned to all venues successfully',
      totalAssignments: venueQuestions.length,
      venues: venues.length,
      questionsPerVenue: questions.length
    });
  } catch (error) {
    console.error('Assign questions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Generate QR codes for specific venue
router.get('/qr-codes/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;

    const venue = await db.getVenueById(parseInt(venueId));
    if (!venue) {
      return res.status(404).json({ 
        success: false,
        message: 'Venue not found' 
      });
    }

    const venueQuestions = await db.getVenueQuestions(parseInt(venueId));

    const qrCodes = [];
    for (const vq of venueQuestions) {
      const qrData = await QRGenerator.generateQRCode(
        venue.id,
        vq.question_id,
        vq.qr_token
      );
      qrCodes.push({
        venueId: venue.id,
        venueName: venue.venue_name,
        questionId: vq.question_id,
        questionText: vq.question_text,
        token: vq.qr_token,
        qrUrl: qrData.url,
        qrCodeImage: qrData.qrCodeDataURL
      });
    }
    
    res.json({
      success: true,
      message: 'QR codes generated successfully',
      venue: venue.venue_name,
      count: qrCodes.length,
      qrCodes
    });
  } catch (error) {
    console.error('Generate QR codes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Generate QR codes for all venues
router.get('/qr-codes/all', async (req, res) => {
  try {
    const venues = await db.getAllVenues();

    const allQRCodes = [];
    for (const venue of venues) {
      const venueQuestions = await db.getVenueQuestions(venue.id);
      
      const qrCodes = [];
      for (const vq of venueQuestions) {
        const qrData = await QRGenerator.generateQRCode(
          venue.id,
          vq.question_id,
          vq.qr_token
        );
        qrCodes.push({
          venueId: venue.id,
          venueName: venue.venue_name,
          questionId: vq.question_id,
          questionText: vq.question_text,
          token: vq.qr_token,
          qrUrl: qrData.url,
          qrCodeImage: qrData.qrCodeDataURL
        });
      }
      
      allQRCodes.push({
        venueId: venue.id,
        venueName: venue.venue_name,
        qrCodes
      });
    }
    res.json({
      success: true,
      message: 'QR codes generated for all venues',
      count: allQRCodes.length,
      venues: allQRCodes
    });
  } catch (error) {
    console.error('Generate all QR codes error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    const venueStats = await db.getVenueStats();

    const totalAttempts = parseInt(stats.total_attempts || 0);
    const correctAttempts = parseInt(stats.correct_attempts || 0);

    res.json({
      success: true,
      totalVenues: parseInt(stats.total_venues || 0),
      totalTeams: parseInt(stats.total_teams || 0),
      teamsPerVenue: stats.total_venues > 0 ? 
        Math.round(stats.total_teams / stats.total_venues) : 0,
      totalQuestions: parseInt(stats.total_questions || 0),
      totalAttempts,
      correctAttempts,
      incorrectAttempts: totalAttempts - correctAttempts,
      accuracy: totalAttempts > 0 ? 
        Math.round((correctAttempts / totalAttempts) * 100) : 0,
      venueStats: venueStats.map(v => ({
        venueName: v.venue_name,
        teamsCount: parseInt(v.teams_count || 0),
        expiredQuestions: parseInt(v.expired_questions || 0)
      }))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching admin stats', 
      error: error.message 
    });
  }
});

// Reset event
router.post('/reset-event', async (req, res) => {
  try {
    await db.resetEvent();

    req.io?.to('leaderboard').emit('leaderboard-update');

    res.json({ 
      success: true,
      message: 'Event reset successfully' 
    });
  } catch (error) {
    console.error('Reset event error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;