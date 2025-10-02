const express = require('express');
const Team = require('../models/Team');
const router = express.Router();

// Register team
router.post('/register', async (req, res) => {
  try {
    const { teamName, leaderName, email } = req.body;

    // Check if team or email already exists
    const existingTeam = await Team.findOne({
      $or: [{ teamName }, { email }]
    });

    if (existingTeam) {
      return res.status(400).json({
        message: 'Team name or email already exists'
      });
    }

    const team = new Team({
      teamName,
      leaderName,
      email
    });

    await team.save();

    res.status(201).json({
      message: 'Team registered successfully',
      teamId: team._id,
      team: {
        id: team._id,
        teamName: team.teamName,
        leaderName: team.leaderName,
        totalPoints: team.totalPoints
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get team details
router.get('/:teamId', async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      id: team._id,
      teamName: team.teamName,
      leaderName: team.leaderName,
      totalPoints: team.totalPoints
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;