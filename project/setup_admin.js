require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME
    });
    console.log('Connected to database.');
    
    await conn.query(`
      INSERT IGNORE INTO users (name, email, password_hash, role)
      VALUES (
        'Admin',
        'admin@mail.com',
        '$2b$10$7sQ8lP6F7m0rWn7CkC2i1u6XjZg2wqgQn7GZk0QF0rjF1G0yQ5K3K',
        'ADMIN'
      );
    `);
    console.log('Admin inserted or already exists.');
    
    await conn.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
