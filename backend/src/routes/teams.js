const express = require('express');
const db = require('../db/queries');
const router = express.Router();

// Team login
router.post('/login', async (req, res) => {
  try {
    const { teamName, registrationCode } = req.body;

    // Validate inputs
    if (!teamName || !registrationCode) {
      return res.status(400).json({
        message: 'Team name and registration code are required'
      });
    }

    // Check if team exists with this name
    const team = await db.getTeamByName(teamName);
    if (!team) {
      return res.status(401).json({
        message: 'Invalid team name or registration code'
      });
    }

    // Verify the registration code matches this team
    const codeValid = await db.verifyTeamRegistrationCode(team.id, registrationCode);
    if (!codeValid) {
      return res.status(401).json({
        message: 'Invalid team name or registration code'
      });
    }

    // Return team data
    res.json({
      message: 'Login successful',
      team: {
        id: team.id,
        teamName: team.team_name,
        leaderName: team.leader_name,
        venue: team.venue_name,
        venueId: team.venue_id,
        score: team.score
      }
    });
  } catch (error) {
    console.error('Team login error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Register team
router.post('/register', async (req, res) => {
  try {
    const { teamName, leaderName, email, venueId, registrationCode } = req.body;

    // Validate inputs
    if (!teamName || !leaderName || !email || !venueId || !registrationCode) {
      return res.status(400).json({
        message: 'All fields are required including registration code'
      });
    }

    // Validate registration code
    const validCode = await db.validateRegistrationCode(registrationCode);
    if (!validCode) {
      return res.status(400).json({
        message: 'Invalid or already used registration code'
      });
    }

    // Check venue exists
    const venue = await db.getVenueById(parseInt(venueId));
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    // No team limit - removed capacity check

    // Check if team name or email already exists
    const existingTeam = await db.checkTeamExists(teamName, email);
    if (existingTeam) {
      return res.status(400).json({
        message: 'Team name or email already exists'
      });
    }

    // Create team
    const team = await db.createTeam(
      teamName,
      leaderName,
      email,
      parseInt(venueId)
    );

    // Mark code as used
    await db.useRegistrationCode(registrationCode, team.id);

    const teamWithVenue = await db.getTeamById(team.id);

    res.status(201).json({
      message: 'Team registered successfully',
      team: {
        id: teamWithVenue.id,
        teamName: teamWithVenue.team_name,
        leaderName: teamWithVenue.leader_name,
        venue: teamWithVenue.venue_name,
        venueId: teamWithVenue.venue_id,
        score: teamWithVenue.score
      }
    });
  } catch (error) {
    console.error('Team registration error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

// Get team details
router.get('/:teamId', async (req, res) => {
  try {
    const team = await db.getTeamById(parseInt(req.params.teamId));

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const attempts = await db.getTeamAttempts(team.id);

    res.json({
      id: team.id,
      teamName: team.team_name,
      leaderName: team.leader_name,
      venue: team.venue_name,
      venueId: team.venue_id,
      score: team.score,
      attempts: attempts.map(a => ({
        questionText: a.question_text,
        chosenOption: a.chosen_option,
        correctOption: a.correct_option,
        isCorrect: a.is_correct,
        timeTaken: a.time_taken,
        pointsAwarded: a.points_awarded,
        submittedAt: a.submitted_at
      }))
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;