const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Environment Configuration
 * Centralizes all environment variables used in the application
 */
const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend Configuration
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,

  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL || '/api',

  // Security Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // Event Configuration
  MAX_TEAMS_PER_VENUE: parseInt(process.env.MAX_TEAMS_PER_VENUE) || 5,
  QUESTION_BASE_POINTS: parseInt(process.env.QUESTION_BASE_POINTS) || 20,
  MAX_QUESTION_TIME_SECONDS: parseInt(process.env.MAX_QUESTION_TIME_SECONDS) || 20,
};

/**
 * Validate required environment variables
 */
const requiredEnvVars = [
  'DATABASE_URL',
  // 'JWT_SECRET', // Optional for development
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

/**
 * Validate environment-specific configurations
 */
if (config.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback-secret-key') {
    console.error('❌ JWT_SECRET must be set in production environment');
    process.exit(1);
  }
}

module.exports = config;
