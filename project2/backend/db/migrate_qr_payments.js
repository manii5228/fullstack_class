/**
 * Migration: Add QR tokens + payment orders tables
 * Run: node db/migrate_qr_payments.js
 */
const db = require('./connection');

async function run() {
  console.log('🔄 Running QR + Payments migration...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS qr_tokens (
        qr_id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        scanned_at TIMESTAMP NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        UNIQUE KEY unique_booking_qr (booking_id),
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✅ qr_tokens table ready');

    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_orders (
        order_id VARCHAR(100) PRIMARY KEY,
        user_id INT NOT NULL,
        event_id INT NOT NULL,
        ticket_count INT NOT NULL DEFAULT 1,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status ENUM('created','paid','failed') DEFAULT 'created',
        razorpay_payment_id VARCHAR(100) DEFAULT NULL,
        attendees JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
      )
    `);
    console.log('  ✅ payment_orders table ready');

    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
