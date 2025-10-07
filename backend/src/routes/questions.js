const express = require('express');
const db = require('../db/queries');
const PointsCalculator = require('../utils/pointsCalculator');
const router = express.Router();

// Get question by venue and token
router.get('/venue/:venueId/question/:questionId', async (req, res) => {
  try {
    const { venueId, questionId } = req.params;
    const { token, teamId } = req.query;

    if (!token || !teamId) {
      return res.status(400).json({ 
        message: 'Token and Team ID are required' 
      });
    }

    // Verify team belongs to venue
    const team = await db.getTeamById(parseInt(teamId));
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.venue_id !== parseInt(venueId)) {
      return res.status(403).json({ 
        message: 'This question belongs to a different venue' 
      });
    }

    // Get venue question
    const venueQuestion = await db.getVenueQuestion(
      parseInt(venueId),
      parseInt(questionId),
      token
    );

    if (!venueQuestion) {
      return res.status(404).json({ 
        message: 'Question not found or invalid token' 
      });
    }

    // Check if question is active
    if (!venueQuestion.is_active) {
      return res.status(410).json({ 
        message: 'This question has been solved in your venue' 
      });
    }

    // Check if team already attempted
    const existingAttempt = await db.checkTeamAttempt(
      parseInt(teamId),
      parseInt(questionId),
      parseInt(venueId)
    );

    if (existingAttempt) {
      return res.status(400).json({ 
        message: 'You have already attempted this question',
        wasCorrect: existingAttempt.is_correct
      });
    }

    // Return question
    res.json({
      questionId: venueQuestion.question_id,
      questionText: venueQuestion.question_text,
      options: {
        A: venueQuestion.option_a,
        B: venueQuestion.option_b,
        C: venueQuestion.option_c,
        D: venueQuestion.option_d
      },
      basePoints: venueQuestion.base_points,
      timeLimit: 20,
      token: venueQuestion.qr_token
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Submit answer
router.post('/venue/:venueId/question/:questionId/answer', async (req, res) => {
  try {
    const { venueId, questionId } = req.params;
    const { teamId, chosenOption, timeTaken, token, notAttempted, submittedAt, isTimeout, submissionType } = req.body;

    // Validate and parse IDs
    const parsedTeamId = parseInt(teamId);
    const parsedVenueId = parseInt(venueId);
    const parsedQuestionId = parseInt(questionId);

    if (isNaN(parsedTeamId) || isNaN(parsedVenueId) || isNaN(parsedQuestionId)) {
      console.log('Invalid ID parameters:', { teamId, venueId, questionId });
      return res.status(400).json({
        message: 'Invalid ID parameters'
      });
    }


    // Validate inputs
    if (!teamId || (chosenOption === undefined || chosenOption === null) || timeTaken === undefined || !token) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    if (submittedAt) {
      const clientLatency = Date.now() - new Date(submittedAt).getTime();
      console.log(`Answer submission latency: ${clientLatency}ms`);
    }

    // Handle timeout scenarios specially
    if (isTimeout || submissionType === 'timeout') {
      console.log('Processing timeout submission');

      // For timeout scenarios, we can add special handling
      // For example, different messaging or analytics tracking

      // Since it's a timeout, we could modify the response message
      // or add timeout-specific fields to the response
    }

    // Verify team
    const team = await db.getTeamById(parsedTeamId);
    if (!team || team.venue_id !== parsedVenueId) {
      console.log('Team verification failed:', {
        teamId: parsedTeamId,
        venueId: parsedVenueId,
        teamFound: !!team,
        teamVenueId: team?.venue_id
      });
      return res.status(403).json({
        message: 'Invalid team or venue'
      });
    }

    // Store team score for response (before any modifications)
    const originalTeamScore = team.score;

    // Get venue question
    const venueQuestion = await db.getVenueQuestion(
      parsedVenueId,
      parsedQuestionId,
      token
    );

    if (!venueQuestion || !venueQuestion.is_active) {
      console.log('Question not available:', { venueId: parsedVenueId, questionId: parsedQuestionId, isActive: venueQuestion?.is_active });
      return res.status(410).json({
        message: 'Question not available'
      });
    }

    // Check existing attempt
    const existingAttempt = await db.checkTeamAttempt(
      parsedTeamId,
      parsedQuestionId,
      parsedVenueId
    );

    if (existingAttempt) {
      console.log('Duplicate attempt detected');
      return res.status(400).json({
        message: 'You have already attempted this question'
      });
    }

    // Check answer
    const isCorrect = chosenOption.toUpperCase() ===
                     venueQuestion.correct_option.toUpperCase();

    console.log('Answer validation:', {
      chosenOption,
      correctOption: venueQuestion.correct_option,
      isCorrect,
      isTimeout: isTimeout || false,
      submissionType
    });

    const pointsAwarded = isCorrect ?
      PointsCalculator.calculatePoints(venueQuestion.base_points, timeTaken) : 0;

    // Create attempt
    await db.createAttempt(
      parsedTeamId,
      parsedQuestionId,
      parsedVenueId,
      chosenOption.toUpperCase(),
      isCorrect,
      timeTaken,
      pointsAwarded
    );

    console.log('Attempt created successfully');

    // If correct, expire question and update score
    if (isCorrect) {
      await db.expireVenueQuestion(parsedVenueId, parsedQuestionId);
      await db.updateTeamScore(parsedTeamId, pointsAwarded);

      // Emit real-time updates
      req.io?.to('leaderboard').emit('leaderboard-update');
      req.io?.to(`venue-${parsedVenueId}`).emit('question-expired', {
        questionId: parsedQuestionId
      });
    }

    console.log('Sending response:', {
      isCorrect,
      pointsAwarded,
      notAttempted,
      isTimeout,
      submissionType
    });

    res.json({
      message: isCorrect ?
        `Correct! You earned ${pointsAwarded} points.` :
        (isTimeout || submissionType === 'timeout') ?
          'Time expired! No points awarded.' :
          'Incorrect answer. No points awarded.',
      isCorrect,
      pointsAwarded,
      correctAnswer: !isCorrect ? venueQuestion.correct_option : undefined,
      timeTaken,
      teamScore: isCorrect ? originalTeamScore + pointsAwarded : originalTeamScore,
      notAttempted: notAttempted || false,
      isTimeout: isTimeout || false,
      submissionType: submissionType || 'manual'
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Get available questions
router.get('/venue/:venueId/available', async (req, res) => {
  try {
    const { venueId } = req.params;
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required' });
    }

    const team = await db.getTeamById(parseInt(teamId));
    if (!team || team.venue_id !== parseInt(venueId)) {
      return res.status(403).json({ message: 'Invalid team or venue' });
    }

    const availableQuestions = await db.getAvailableVenueQuestions(
      parseInt(venueId),
      parseInt(teamId)
    );

    const teamAttempts = await db.getTeamAttempts(parseInt(teamId));

    const allVenueQuestions = await db.getVenueQuestions(parseInt(venueId));

    res.json({
      availableCount: availableQuestions.length,
      attemptedCount: teamAttempts.length,
      totalQuestions: allVenueQuestions.length,
      availableQuestions: availableQuestions.map(q => ({
        questionId: q.question_id,
        questionText: q.question_text,
        basePoints: q.base_points,
        qrToken: q.qr_token
      })),
      attemptedQuestions: teamAttempts.map(a => ({
        questionId: a.question_id,
        questionText: a.question_text,
        isCorrect: a.is_correct
      }))
    });
  } catch (error) {
    console.error('Get available questions error:', error);
    res.status(500).json({ 
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
      message: 'Questions assigned to all venues successfully',
      totalAssignments: venueQuestions.length,
      venues: venues.length,
      questionsPerVenue: questions.length
    });
  } catch (error) {
    console.error('Assign questions error:', error);
    res.status(500).json({ 
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
      return res.status(404).json({ message: 'Venue not found' });
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
      message: 'QR codes generated successfully',
      venue: venue.venue_name,
      qrCodes
    });
  } catch (error) {
    console.error('Generate QR codes error:', error);
    res.status(500).json({ 
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
      message: 'QR codes generated for all venues',
      venues: allQRCodes
    });
  } catch (error) {
    console.error('Generate all QR codes error:', error);
    res.status(500).json({ 
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

    const totalAttempts = parseInt(stats.total_attempts);
    const correctAttempts = parseInt(stats.correct_attempts);

    res.json({
      totalVenues: parseInt(stats.total_venues),
      totalTeams: parseInt(stats.total_teams),
      teamsPerVenue: stats.total_venues > 0 ? 
        Math.round(stats.total_teams / stats.total_venues) : 0,
      totalQuestions: parseInt(stats.total_questions),
      totalAttempts,
      correctAttempts,
      incorrectAttempts: totalAttempts - correctAttempts,
      accuracy: totalAttempts > 0 ? 
        Math.round((correctAttempts / totalAttempts) * 100) : 0,
      venueStats: venueStats.map(v => ({
        venueName: v.venue_name,
        teamsCount: parseInt(v.teams_count),
        expiredQuestions: parseInt(v.expired_questions)
      }))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Reset event
router.post('/reset-event', async (req, res) => {
  try {
    await db.resetEvent();

    req.io?.to('leaderboard').emit('leaderboard-update');

    res.json({ message: 'Event reset successfully' });
  } catch (error) {
    console.error('Reset event error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;