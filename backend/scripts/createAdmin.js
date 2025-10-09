require('dotenv').config();
const { sql } = require('../src/config/database');
const { hashPassword } = require('../src/utils/auth');

async function createAdmin() {
  const username = 'admin';
  const password = 'hawkthunder'; // In production, you should use a more secure password
  
  try {
    // Check if admin already exists
    const [existingAdmin] = await sql`
      SELECT id FROM admins WHERE username = ${username}
    `;
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hashPassword(password);
    await sql`
      INSERT INTO admins (username, password_hash)
      VALUES (${username}, ${hashedPassword})
    `;
    
    console.log('Admin user created successfully!');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log('\nIMPORTANT: Change this password after first login!');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAdmin();
