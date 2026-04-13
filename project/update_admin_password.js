require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function main() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    
    // Create new hash for 123456
    const hash = await bcrypt.hash('123456', 10);
    
    await conn.query(`
      UPDATE users SET password_hash = ? WHERE email = 'admin@mail.com';
    `, [hash]);
    
    console.log('Password successfully reset for admin.');
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
