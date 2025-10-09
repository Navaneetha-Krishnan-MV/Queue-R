const { verifyToken } = require('../utils/auth');
const db = require('../db/queries');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    // Check if admin exists
    const admin = await db.getAdminById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        success: false,
        message: 'Admin not found' 
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during authentication' 
    });
  }
};

module.exports = auth;
