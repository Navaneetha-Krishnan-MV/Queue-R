const fs = require('fs');
const path = require('path');
const { sql } = require('../config/database');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement) {
        // Use the unsafe method for raw SQL
        await sql.unsafe(statement);
      }
    }
    
    console.log('✅ Database setup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();