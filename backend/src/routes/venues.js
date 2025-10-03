const express = require('express');
const db = require('../db/queries');
const router = express.Router();

// Get all venues
router.get('/', async (req, res) => {
  try {
    const venues = await db.getAllVenues();

    const venuesData = venues.map(v => ({
      id: v.id,
      venueName: v.venue_name,
      teamsCount: parseInt(v.teams_count),
      availableSlots: 5 - parseInt(v.teams_count),
      activeQuestionsCount: parseInt(v.active_questions_count),
      isFull: parseInt(v.teams_count) >= 5
    }));

    res.json(venuesData);
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get specific venue details
router.get('/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;

    const venue = await db.getVenueById(parseInt(venueId));
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const { sql } = require('../config/database');
    
    // Get teams for this venue
    const teams = await sql`
      SELECT id, team_name, leader_name, score
      FROM teams
      WHERE venue_id = ${parseInt(venueId)}
      ORDER BY score DESC
    `;

    res.json({
      id: venue.id,
      venueName: venue.venue_name,
      teams: teams.map(t => ({
        id: t.id,
        teamName: t.team_name,
        leaderName: t.leader_name,
        score: t.score
      })),
      teamsCount: parseInt(venue.teams_count),
      availableSlots: 5 - parseInt(venue.teams_count),
      totalQuestions: parseInt(venue.total_questions),
      activeQuestionsCount: parseInt(venue.active_questions_count),
      expiredQuestionsCount: parseInt(venue.total_questions) - parseInt(venue.active_questions_count),
      isFull: parseInt(venue.teams_count) >= 5
    });
  } catch (error) {
    console.error('Get venue details error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;