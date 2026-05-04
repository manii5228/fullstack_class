const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');
require('dotenv').config();

const QR_WINDOW_MINUTES = 30;  // Generate QR 30 min before event
const QR_EXPIRY_AFTER_SCAN_MINUTES = 20; // Delete 20 min after scan

// GET /api/qr/:booking_id/generate
// Returns QR code image only if event is within 30 minutes
router.get('/:booking_id/generate', authenticateUser, async (req, res) => {
  try {
    const { booking_id } = req.params;

    // Fetch booking + event details
    const [rows] = await db.query(
      `SELECT b.*, e.title, e.venue, e.event_date, e.event_time
       FROM bookings b JOIN events e ON b.event_id = e.event_id
       WHERE b.booking_id = ? AND b.user_id = ? AND b.status = 'confirmed'`,
      [booking_id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found or not confirmed' });
    }

    const booking = rows[0];

    // Calculate event datetime
    const eventDateStr = new Date(booking.event_date).toISOString().split('T')[0];
    const eventDateTime = new Date(`${eventDateStr}T${booking.event_time}`);
    const now = new Date();
    const minutesUntilEvent = (eventDateTime - now) / 60000;

    // Allow QR 30 min before event and up to 2 hours after start
    if (minutesUntilEvent > QR_WINDOW_MINUTES) {
      const readableTime = eventDateTime.toLocaleString('en-IN');
      return res.status(425).json({
        message: `QR code will be available 30 minutes before the event`,
        event_time: readableTime,
        minutes_remaining: Math.ceil(minutesUntilEvent - QR_WINDOW_MINUTES),
      });
    }

    if (minutesUntilEvent < -120) {
      return res.status(410).json({ message: 'Event has ended. QR code expired.' });
    }

    // Check existing valid QR
    const [existing] = await db.query(
      'SELECT * FROM qr_tokens WHERE booking_id = ? AND is_used = FALSE AND expires_at > NOW()',
      [booking_id]
    );

    let qrPayload;
    if (existing.length > 0) {
      qrPayload = existing[0].token_hash;
    } else {
      // Generate new QR token
      const token = jwt.sign(
        { booking_id: parseInt(booking_id), user_id: req.user.id, event_id: booking.event_id },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );

      const expiresAt = new Date(eventDateTime.getTime() + 2 * 60 * 60 * 1000); // 2hr after event start

      // Upsert
      await db.query(
        `INSERT INTO qr_tokens (booking_id, token_hash, expires_at)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE token_hash=VALUES(token_hash), expires_at=VALUES(expires_at), is_used=FALSE, scanned_at=NULL`,
        [booking_id, token, expiresAt]
      );

      qrPayload = token;
    }

    // Generate QR image as data URL
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 300,
      margin: 2,
      color: { dark: '#3C0908', light: '#FCEFD5' }
    });

    res.json({
      qr_image: qrDataUrl,
      booking_id: parseInt(booking_id),
      event_title: booking.title,
      event_time: booking.event_time,
      event_date: booking.event_date,
      venue: booking.venue,
      ticket_count: booking.ticket_count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'QR generation failed', error: err.message });
  }
});

// POST /api/qr/verify  (Admin scans QR)
router.post('/verify', authenticateAdmin, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token required' });

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    const { booking_id, user_id, event_id } = decoded;

    // Check DB record
    const [qr] = await db.query(
      'SELECT * FROM qr_tokens WHERE booking_id = ? AND token_hash = ?',
      [booking_id, token]
    );

    if (qr.length === 0) return res.status(404).json({ message: 'QR not found' });
    if (qr[0].is_used) {
      return res.status(409).json({
        message: 'Ticket already scanned!',
        scanned_at: qr[0].scanned_at,
      });
    }

    // Mark as used + set deletion time
    const deletesAt = new Date(Date.now() + QR_EXPIRY_AFTER_SCAN_MINUTES * 60 * 1000);
    await db.query(
      'UPDATE qr_tokens SET is_used=TRUE, scanned_at=NOW(), expires_at=? WHERE booking_id=?',
      [deletesAt, booking_id]
    );

    // Fetch booking info for admin
    const [rows] = await db.query(
      `SELECT b.*, e.title, e.venue, e.event_date, e.event_time, u.name, u.email, u.department, u.vtu_number
       FROM bookings b
       JOIN events e ON b.event_id = e.event_id
       JOIN users u ON b.user_id = u.user_id
       WHERE b.booking_id = ?`,
      [booking_id]
    );

    res.json({
      message: '✅ Ticket verified successfully!',
      valid: true,
      attendee: rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
});

module.exports = router;
