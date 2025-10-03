const express = require('express');
const db = require('../db/queries');
const router = express.Router();

// Register team
router.post('/register', async (req, res) => {
  try {
    const { teamName, leaderName, email, venueId } = req.body;

    // Validate inputs
    if (!teamName || !leaderName || !email || !venueId) {
      return res.status(400).json({ 
        message: 'All fields are required' 
      });
    }

    // Check venue exists and capacity
    const venue = await db.getVenueById(parseInt(venueId));
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const teamsCount = await db.getVenueTeamsCount(parseInt(venueId));
    if (teamsCount >= 5) {
      return res.status(400).json({
        message: 'This venue is full (maximum 5 teams)'
      });
    }

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