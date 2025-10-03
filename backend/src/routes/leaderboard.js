const express = require('express');
const db = require('../db/queries');
const router = express.Router();

// Get global leaderboard
router.get('/', async (req, res) => {
  try {
    const teams = await db.getGlobalLeaderboard();

    const leaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamId: team.team_id,
      teamName: team.team_name,
      leaderName: team.leader_name,
      venueName: team.venue_name,
      venueId: team.venue_id,
      score: team.score,
      registeredAt: team.created_at
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get venue leaderboard
router.get('/venue/:venueId', async (req, res) => {
  try {
    const { venueId } = req.params;

    const { sql } = require('../config/database');
    const venue = await sql`
      SELECT venue_name FROM venues WHERE id = ${parseInt(venueId)}
    `;

    if (venue.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }

    const teams = await db.getVenueLeaderboard(parseInt(venueId));

    const venueLeaderboard = teams.map((team, index) => ({
      rank: index + 1,
      teamId: team.team_id,
      teamName: team.team_name,
      leaderName: team.leader_name,
      score: team.score,
      correctAnswers: parseInt(team.correct_answers),
      registeredAt: team.created_at
    }));

    res.json({
      venueId: parseInt(venueId),
      venueName: venue[0].venue_name,
      leaderboard: venueLeaderboard
    });
  } catch (error) {
    console.error('Venue leaderboard error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get team statistics
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await db.getTeamById(parseInt(teamId));
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const attempts = await db.getTeamAttempts(parseInt(teamId));

    // Get rank
    const allTeams = await db.getGlobalLeaderboard();
    const rank = allTeams.findIndex(t => t.team_id === parseInt(teamId)) + 1;

    const correctAttempts = attempts.filter(a => a.is_correct);
    const incorrectAttempts = attempts.filter(a => !a.is_correct);

    const avgTime = attempts.length > 0 ?
      Math.round(attempts.reduce((sum, a) => sum + a.time_taken, 0) / attempts.length) : 0;

    res.json({
      rank,
      totalTeams: allTeams.length,
      teamId: team.id,
      teamName: team.team_name,
      leaderName: team.leader_name,
      venueName: team.venue_name,
      venueId: team.venue_id,
      score: team.score,
      statistics: {
        totalAttempts: attempts.length,
        correctAnswers: correctAttempts.length,
        incorrectAnswers: incorrectAttempts.length,
        accuracy: attempts.length > 0 ?
          Math.round((correctAttempts.length / attempts.length) * 100) : 0,
        averageTime: avgTime
      },
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
    console.error('Team stats error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get leaderboard overview statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.getLeaderboardStats();
    const venueStats = await db.getVenueStats();

    const totalAttempts = parseInt(stats.total_attempts);
    const correctAttempts = parseInt(stats.correct_attempts);

    // Get top team
    const topTeams = await db.getGlobalLeaderboard();
    const topTeam = topTeams.length > 0 ? topTeams[0] : null;

    res.json({
      totalTeams: parseInt(stats.total_teams),
      totalAttempts,
      correctAttempts,
      incorrectAttempts: totalAttempts - correctAttempts,
      accuracy: totalAttempts > 0 ?
        Math.round((correctAttempts / totalAttempts) * 100) : 0,
      totalQuestions: parseInt(stats.total_questions),
      questionsPerVenue: parseInt(stats.total_questions),
      topTeam: topTeam ? {
        teamName: topTeam.team_name,
        venueName: topTeam.venue_name,
        score: topTeam.score
      } : null,
      venues: venueStats.map(v => ({
        venueName: v.venue_name,
        teamsCount: parseInt(v.teams_count),
        expiredQuestions: parseInt(v.expired_questions),
        activeQuestions: parseInt(stats.total_questions) - parseInt(v.expired_questions)
      }))
    });
  } catch (error) {
    console.error('Leaderboard stats error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;