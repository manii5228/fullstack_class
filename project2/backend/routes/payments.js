const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../db/connection');
const { authenticateUser } = require('../middleware/auth');
require('dotenv').config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payments/create-order
// Creates a Razorpay order before booking; attendees data is stored
router.post('/create-order', authenticateUser, async (req, res) => {
  try {
    const { event_id, ticket_count, attendees } = req.body;
    if (!event_id || !ticket_count || ticket_count < 1) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const [events] = await db.query('SELECT * FROM events WHERE event_id = ? AND status = "active"', [event_id]);
    if (events.length === 0) return res.status(404).json({ message: 'Event not found or inactive' });

    const event = events[0];
    if (event.available_tickets < ticket_count) {
      return res.status(400).json({ message: `Only ${event.available_tickets} tickets available` });
    }

    const amount = Math.round(parseFloat(event.price) * ticket_count * 100); // paise

    // For free events, skip Razorpay
    if (amount === 0) {
      return res.status(400).json({ message: 'Use direct booking for free events' });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        event_id: String(event_id),
        user_id: String(req.user.id),
        ticket_count: String(ticket_count),
      }
    });

    // Save order
    await db.query(
      `INSERT INTO payment_orders (order_id, user_id, event_id, ticket_count, amount, attendees)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [order.id, req.user.id, event_id, ticket_count, parseFloat(event.price) * ticket_count, JSON.stringify(attendees || [])]
    );

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
      event_title: event.title,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
});

// POST /api/payments/verify
// Verifies Razorpay signature and creates booking
router.post('/verify', authenticateUser, async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    await conn.beginTransaction();

    // Get order details
    const [orders] = await conn.query('SELECT * FROM payment_orders WHERE order_id = ?', [razorpay_order_id]);
    if (orders.length === 0) { await conn.rollback(); return res.status(404).json({ message: 'Order not found' }); }

    const order = orders[0];
    if (order.status === 'paid') { await conn.rollback(); return res.status(409).json({ message: 'Order already processed' }); }

    // Update order
    await conn.query(
      'UPDATE payment_orders SET status="paid", razorpay_payment_id=? WHERE order_id=?',
      [razorpay_payment_id, razorpay_order_id]
    );

    // Lock event and create booking
    const [events] = await conn.query('SELECT * FROM events WHERE event_id = ? FOR UPDATE', [order.event_id]);
    const event = events[0];

    if (event.available_tickets < order.ticket_count) {
      await conn.rollback();
      return res.status(400).json({ message: 'Tickets sold out during payment' });
    }

    const [result] = await conn.query(
      'INSERT INTO bookings (user_id, event_id, ticket_count, total_price, status) VALUES (?, ?, ?, ?, "confirmed")',
      [order.user_id, order.event_id, order.ticket_count, order.amount]
    );

    const new_available = event.available_tickets - order.ticket_count;
    await conn.query(
      'UPDATE events SET available_tickets=?, status=? WHERE event_id=?',
      [new_available, new_available === 0 ? 'full' : 'active', order.event_id]
    );

    await conn.query(
      'UPDATE event_analytics SET bookings=bookings+? WHERE event_id=?',
      [order.ticket_count, order.event_id]
    );

    await conn.commit();

    res.json({
      message: 'Payment verified and booking confirmed!',
      booking: { booking_id: result.insertId, ticket_count: order.ticket_count, total_price: order.amount, status: 'confirmed' },
      remaining_tickets: new_available,
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ message: 'Verification failed', error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
