const express = require('express');
const Team = require('../models/Team');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const router = express.Router();

// Get current leaderboard
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 }) // Sort by points desc, then by registration time asc (tiebreaker)
      .select('teamName leaderName email totalPoints createdAt');

    const leaderboardData = teams.map((team, index) => ({
      rank: index + 1,
      id: team._id,
      teamName: team.teamName,
      leaderName: team.leaderName,
      email: team.email,
      totalPoints: team.totalPoints,
      registeredAt: team.createdAt
    }));

    res.json(leaderboardData);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get detailed leaderboard with team statistics
router.get('/detailed', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 });

    const detailedLeaderboard = await Promise.all(
      teams.map(async (team, index) => {
        // Get team's answer statistics
        const teamAnswers = await Answer.find({ teamId: team._id })
          .populate('questionId', 'questionId questionText points');

        const correctAnswers = teamAnswers.filter(answer => answer.isCorrect);
        const incorrectAnswers = teamAnswers.filter(answer => !answer.isCorrect);
        
        // Get questions answered by this team
        const questionsAnswered = teamAnswers.map(answer => ({
          questionId: answer.questionId?.questionId,
          questionText: answer.questionId?.questionText,
          submittedAnswer: answer.submittedAnswer,
          isCorrect: answer.isCorrect,
          pointsAwarded: answer.pointsAwarded,
          submittedAt: answer.createdAt
        }));

        return {
          rank: index + 1,
          id: team._id,
          teamName: team.teamName,
          leaderName: team.leaderName,
          email: team.email,
          totalPoints: team.totalPoints,
          registeredAt: team.createdAt,
          statistics: {
            totalAttempts: teamAnswers.length,
            correctAnswers: correctAnswers.length,
            incorrectAnswers: incorrectAnswers.length,
            accuracy: teamAnswers.length > 0 ? 
              Math.round((correctAnswers.length / teamAnswers.length) * 100) : 0
          },
          questionsAnswered: questionsAnswered.sort((a, b) => 
            new Date(b.submittedAt) - new Date(a.submittedAt)
          )
        };
      })
    );

    res.json(detailedLeaderboard);
  } catch (error) {
    console.error('Detailed leaderboard fetch error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get leaderboard for a specific team
router.get('/team/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Get all teams for ranking
    const allTeams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 })
      .select('_id totalPoints');

    const teamRank = allTeams.findIndex(t => t._id.toString() === teamId) + 1;

    // Get team's answers
    const teamAnswers = await Answer.find({ teamId })
      .populate('questionId', 'questionId questionText points')
      .sort({ createdAt: -1 });

    const teamStats = {
      rank: teamRank,
      totalTeams: allTeams.length,
      id: team._id,
      teamName: team.teamName,
      leaderName: team.leaderName,
      totalPoints: team.totalPoints,
      registeredAt: team.createdAt,
      answers: teamAnswers.map(answer => ({
        questionId: answer.questionId?.questionId,
        questionText: answer.questionId?.questionText,
        submittedAnswer: answer.submittedAnswer,
        isCorrect: answer.isCorrect,
        pointsAwarded: answer.pointsAwarded,
        submittedAt: answer.createdAt
      })),
      statistics: {
        totalAttempts: teamAnswers.length,
        correctAnswers: teamAnswers.filter(a => a.isCorrect).length,
        incorrectAnswers: teamAnswers.filter(a => !a.isCorrect).length,
        accuracy: teamAnswers.length > 0 ? 
          Math.round((teamAnswers.filter(a => a.isCorrect).length / teamAnswers.length) * 100) : 0,
        totalPointsEarned: teamAnswers.reduce((sum, a) => sum + a.pointsAwarded, 0)
      }
    };

    res.json(teamStats);
  } catch (error) {
    console.error('Team leaderboard fetch error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get leaderboard summary statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalTeams,
      totalQuestions,
      answeredQuestions,
      totalAnswers,
      correctAnswers
    ] = await Promise.all([
      Team.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      Question.countDocuments({ isAnswered: true }),
      Answer.countDocuments({}),
      Answer.countDocuments({ isCorrect: true })
    ]);

    // Get top team
    const topTeam = await Team.findOne({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 })
      .select('teamName totalPoints');

    // Get average points
    const teamsWithPoints = await Team.find({ 
      isActive: true, 
      totalPoints: { $gt: 0 } 
    }).select('totalPoints');

    const averagePoints = teamsWithPoints.length > 0 ? 
      Math.round(teamsWithPoints.reduce((sum, team) => sum + team.totalPoints, 0) / teamsWithPoints.length) : 0;

    res.json({
      totalTeams,
      totalQuestions,
      answeredQuestions,
      remainingQuestions: totalQuestions - answeredQuestions,
      totalAnswers,
      correctAnswers,
      incorrectAnswers: totalAnswers - correctAnswers,
      overallAccuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
      topTeam: topTeam ? {
        name: topTeam.teamName,
        points: topTeam.totalPoints
      } : null,
      averagePoints,
      participatingTeams: teamsWithPoints.length, // Teams that have answered at least one question
      completionRate: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
    });
  } catch (error) {
    console.error('Leaderboard stats fetch error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get live leaderboard updates (for real-time display)
router.get('/live', async (req, res) => {
  try {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Function to send leaderboard data
    const sendLeaderboard = async () => {
      try {
        const teams = await Team.find({ isActive: true })
          .sort({ totalPoints: -1, createdAt: 1 })
          .select('teamName leaderName totalPoints')
          .limit(10); // Top 10 teams for live updates

        const data = JSON.stringify(teams.map((team, index) => ({
          rank: index + 1,
          teamName: team.teamName,
          leaderName: team.leaderName,
          totalPoints: team.totalPoints
        })));

        res.write(`data: ${data}\n\n`);
      } catch (error) {
        console.error('Live leaderboard error:', error);
        res.write(`data: ${JSON.stringify({ error: 'Failed to fetch leaderboard' })}\n\n`);
      }
    };

    // Send initial data
    await sendLeaderboard();

    // Set up interval for live updates every 5 seconds
    const interval = setInterval(sendLeaderboard, 5000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
      console.log('Live leaderboard client disconnected');
    });

  } catch (error) {
    console.error('Live leaderboard setup error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get teams by rank range (pagination)
router.get('/range/:start/:end', async (req, res) => {
  try {
    const { start, end } = req.params;
    const startRank = parseInt(start);
    const endRank = parseInt(end);

    if (startRank < 1 || endRank < startRank) {
      return res.status(400).json({ message: 'Invalid rank range' });
    }

    const teams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 })
      .skip(startRank - 1)
      .limit(endRank - startRank + 1)
      .select('teamName leaderName totalPoints createdAt');

    const totalTeams = await Team.countDocuments({ isActive: true });

    const rankedTeams = teams.map((team, index) => ({
      rank: startRank + index,
      id: team._id,
      teamName: team.teamName,
      leaderName: team.leaderName,
      totalPoints: team.totalPoints,
      registeredAt: team.createdAt
    }));

    res.json({
      teams: rankedTeams,
      totalTeams,
      requestedRange: { start: startRank, end: endRank },
      hasMore: endRank < totalTeams
    });
  } catch (error) {
    console.error('Leaderboard range fetch error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;