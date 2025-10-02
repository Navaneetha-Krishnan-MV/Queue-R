const express = require('express');
const Team = require('../models/Team');
const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .sort({ totalPoints: -1, createdAt: 1 })
      .select('teamName leaderName totalPoints');

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;