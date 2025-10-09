const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { testConnection } = require('./config/database');
const config = require('./config/env');

// Import routes
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const venueRoutes = require('./routes/venues');
const teamRoutes = require('./routes/teams');
const questionRoutes = require('./routes/questions');
const leaderboardRoutes = require('./routes/leaderboard');
const auth = require('./middleware/auth');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Test database connection
testConnection().catch(err => {
  console.error('Failed to connect to database');
  process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Public routes
app.use('/api/admin/auth', authRoutes);

// Protected admin routes
app.use('/api/admin', auth, adminRoutes);

// Public API routes
app.use('/api/venues', venueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-leaderboard', () => {
    socket.join('leaderboard');
  });

  socket.on('join-venue', (venueId) => {
    socket.join(`venue-${venueId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: config.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = config.PORT;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Frontend URL: ${config.FRONTEND_URL}`);
  console.log(`💾 Database: Neon PostgreSQL`);
});