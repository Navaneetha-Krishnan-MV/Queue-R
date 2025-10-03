const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { neon } = require('@neondatabase/serverless');

// Create database connection
const client = neon(process.env.DATABASE_URL);

// Add unsafe method for raw SQL queries
const sql = Object.assign(
  (strings, ...values) => client(strings, ...values),
  { unsafe: client }
);

// Test connection
const testConnection = async () => {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected successfully:', result[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = { sql, testConnection };