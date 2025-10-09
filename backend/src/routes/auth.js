const express = require('express');
const db = require('../db/queries');
const { comparePasswords, generateToken } = require('../utils/auth');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admin/auth/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password'
      });
    }

    // Check if admin exists
    const admin = await db.findAdminByUsername(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await comparePasswords(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate and return token
    const token = generateToken(admin.id);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        createdAt: admin.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
});

// @route   GET /api/admin/auth/verify
// @desc    Verify admin token
// @access  Private
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      admin: req.admin
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

module.exports = router;
