const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

async function sendConfirmationEmail(userEmail, userName, event, booking) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `✅ Booking Confirmed - ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #F8F7F4; border-radius: 12px; padding: 32px;">
          <h1 style="color: #6C63FF; margin-bottom: 8px;">Booking Confirmed! 🎉</h1>
          <p style="color: #1F2933;">Hi <strong>${userName}</strong>, your booking is confirmed.</p>
          <div style="background: white; border-radius: 12px; padding: 24px; margin: 20px 0;">
            <h2 style="color: #FF7A59;">${event.title}</h2>
            <p>📅 <strong>Date:</strong> ${new Date(event.event_date).toDateString()}</p>
            <p>🕐 <strong>Time:</strong> ${event.event_time}</p>
            <p>📍 <strong>Venue:</strong> ${event.venue}</p>
            <p>🎫 <strong>Tickets:</strong> ${booking.ticket_count}</p>
            <p>💰 <strong>Total Paid:</strong> ₹${booking.total_price}</p>
            <p>🔖 <strong>Booking ID:</strong> #${booking.booking_id}</p>
          </div>
          <p style="color: #888; font-size: 14px;">Thank you for booking with EventBook!</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log('Email send failed (non-critical):', err.message);
  }
}

// CREATE booking
router.post('/', authenticateUser, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { event_id, ticket_count } = req.body;
    const user_id = req.user.id;

    if (!event_id || !ticket_count || ticket_count < 1) {
      await conn.rollback();
      return res.status(400).json({ message: 'Invalid booking data' });
    }

    // Lock event row for update
    const [events] = await conn.query('SELECT * FROM events WHERE event_id = ? FOR UPDATE', [event_id]);
    if (events.length === 0) { await conn.rollback(); return res.status(404).json({ message: 'Event not found' }); }

    const event = events[0];
    if (event.status !== 'active') { await conn.rollback(); return res.status(400).json({ message: 'Event is not accepting bookings' }); }
    if (event.available_tickets < ticket_count) { await conn.rollback(); return res.status(400).json({ message: `Only ${event.available_tickets} tickets available` }); }

    // Check time conflict
    const [conflicts] = await conn.query(
      `SELECT b.booking_id FROM bookings b 
       JOIN events e ON b.event_id = e.event_id 
       WHERE b.user_id = ? AND b.status = 'confirmed' AND e.event_date = ? AND e.event_time = ? AND b.event_id != ?`,
      [user_id, event.event_date, event.event_time, event_id]
    );
    if (conflicts.length > 0) { await conn.rollback(); return res.status(409).json({ message: '⚠️ Time conflict detected! You already have a booking at this time.' }); }

    // Check duplicate booking
    const [existing] = await conn.query('SELECT booking_id FROM bookings WHERE user_id = ? AND event_id = ? AND status = "confirmed"', [user_id, event_id]);
    if (existing.length > 0) { await conn.rollback(); return res.status(409).json({ message: 'You have already booked this event' }); }

    const total_price = event.price * ticket_count;
    const [result] = await conn.query(
      'INSERT INTO bookings (user_id, event_id, ticket_count, total_price, status) VALUES (?, ?, ?, ?, "confirmed")',
      [user_id, event_id, ticket_count, total_price]
    );

    const new_available = event.available_tickets - ticket_count;
    await conn.query(
      'UPDATE events SET available_tickets = ?, status = ? WHERE event_id = ?',
      [new_available, new_available === 0 ? 'full' : 'active', event_id]
    );

    // Update analytics
    await conn.query(
      'UPDATE event_analytics SET bookings = bookings + ?, engagement_score = ROUND((views * 0.3 + (bookings + ?) * 0.7) / 10, 2) WHERE event_id = ?',
      [ticket_count, ticket_count, event_id]
    );

    await conn.commit();

    // Send confirmation email
    const [users] = await db.query('SELECT email, name FROM users WHERE user_id = ?', [user_id]);
    if (users.length > 0) {
      await sendConfirmationEmail(users[0].email, users[0].name, event, { booking_id: result.insertId, ticket_count, total_price });
    }

    res.status(201).json({
      message: 'Booking confirmed!',
      booking: { booking_id: result.insertId, event_id, ticket_count, total_price, status: 'confirmed' },
      remaining_tickets: new_available
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Booking failed', error: err.message });
  } finally {
    conn.release();
  }
});

// GET user bookings
router.get('/my-bookings', authenticateUser, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, e.title, e.venue, e.event_date, e.event_time, e.category, e.poster_url, e.department
       FROM bookings b JOIN events e ON b.event_id = e.event_id
       WHERE b.user_id = ? ORDER BY b.booking_date DESC`,
      [req.user.id]
    );
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// GET all bookings (Admin)
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, e.title, e.venue, e.event_date, u.name as user_name, u.email as user_email, u.department as user_department
       FROM bookings b 
       JOIN events e ON b.event_id = e.event_id
       JOIN users u ON b.user_id = u.user_id
       ORDER BY b.booking_date DESC`
    );
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings', error: err.message });
  }
});

// CANCEL booking
router.patch('/:id/cancel', authenticateUser, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [bookings] = await conn.query('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (bookings.length === 0) { await conn.rollback(); return res.status(404).json({ message: 'Booking not found' }); }

    const booking = bookings[0];
    if (booking.status === 'cancelled') { await conn.rollback(); return res.status(400).json({ message: 'Booking already cancelled' }); }

    await conn.query('UPDATE bookings SET status = "cancelled" WHERE booking_id = ?', [req.params.id]);
    await conn.query('UPDATE events SET available_tickets = available_tickets + ?, status = "active" WHERE event_id = ?', [booking.ticket_count, booking.event_id]);

    await conn.commit();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error cancelling booking', error: err.message });
  } finally {
    conn.release();
  }
});

// Waitlist - join
router.post('/waitlist', authenticateUser, async (req, res) => {
  try {
    const { event_id } = req.body;
    const user_id = req.user.id;
    const [existing] = await db.query('SELECT * FROM waitlist WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
    if (existing.length > 0) return res.status(409).json({ message: 'Already on waitlist' });

    await db.query('INSERT INTO waitlist (user_id, event_id) VALUES (?, ?)', [user_id, event_id]);
    res.status(201).json({ message: 'Added to waitlist successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error joining waitlist', error: err.message });
  }
});

// Waitlist - get for event (Admin)
router.get('/waitlist/:event_id', authenticateAdmin, async (req, res) => {
  try {
    const [waitlist] = await db.query(
      `SELECT w.*, u.name, u.email, u.department FROM waitlist w JOIN users u ON w.user_id = u.user_id WHERE w.event_id = ? AND w.status = 'waiting' ORDER BY w.request_time ASC`,
      [req.params.event_id]
    );
    res.json({ waitlist });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching waitlist', error: err.message });
  }
});

// Convert waitlist user to booking (Admin)
router.post('/waitlist/:waitlist_id/convert', authenticateAdmin, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [wl] = await conn.query('SELECT * FROM waitlist WHERE waitlist_id = ?', [req.params.waitlist_id]);
    if (wl.length === 0) { await conn.rollback(); return res.status(404).json({ message: 'Waitlist entry not found' }); }

    const w = wl[0];
    const [events] = await conn.query('SELECT * FROM events WHERE event_id = ? FOR UPDATE', [w.event_id]);
    const event = events[0];
    if (event.available_tickets < 1) { await conn.rollback(); return res.status(400).json({ message: 'No tickets available' }); }

    await conn.query('INSERT INTO bookings (user_id, event_id, ticket_count, total_price, status) VALUES (?, ?, 1, ?, "confirmed")', [w.user_id, w.event_id, event.price]);
    await conn.query('UPDATE events SET available_tickets = available_tickets - 1 WHERE event_id = ?', [w.event_id]);
    await conn.query('UPDATE waitlist SET status = "converted" WHERE waitlist_id = ?', [req.params.waitlist_id]);

    await conn.commit();
    res.json({ message: 'Waitlist user converted to booking' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error converting waitlist', error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
