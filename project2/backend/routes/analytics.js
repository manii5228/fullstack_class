const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateAdmin } = require('../middleware/auth');

// Admin dashboard stats
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const [[{ total_events }]] = await db.query('SELECT COUNT(*) as total_events FROM events WHERE status != "archived"');
    const [[{ total_bookings }]] = await db.query('SELECT COUNT(*) as total_bookings FROM bookings WHERE status = "confirmed"');
    const [[{ total_revenue }]] = await db.query('SELECT COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE status = "confirmed"');
    const [[{ total_tickets_remaining }]] = await db.query('SELECT COALESCE(SUM(available_tickets), 0) as total_tickets_remaining FROM events WHERE status != "archived"');
    const [[{ avg_ticket_price }]] = await db.query('SELECT COALESCE(AVG(price), 0) as avg_ticket_price FROM events WHERE status != "archived"');
    const [[{ total_users }]] = await db.query('SELECT COUNT(*) as total_users FROM users');

    // Top performing event
    const [topEvent] = await db.query(
      `SELECT e.title, COUNT(b.booking_id) as booking_count, COALESCE(SUM(b.total_price), 0) as revenue
       FROM events e LEFT JOIN bookings b ON e.event_id = b.event_id AND b.status = 'confirmed'
       GROUP BY e.event_id ORDER BY booking_count DESC LIMIT 1`
    );

    // Bookings per event
    const [bookingsPerEvent] = await db.query(
      `SELECT e.title, COUNT(b.booking_id) as bookings, COALESCE(SUM(b.total_price), 0) as revenue
       FROM events e LEFT JOIN bookings b ON e.event_id = b.event_id AND b.status = 'confirmed'
       WHERE e.status != 'archived' GROUP BY e.event_id ORDER BY bookings DESC LIMIT 8`
    );

    // Department-wise bookings
    const [deptBookings] = await db.query(
      `SELECT u.department, COUNT(b.booking_id) as bookings
       FROM bookings b JOIN users u ON b.user_id = u.user_id
       WHERE b.status = 'confirmed' AND u.department IS NOT NULL
       GROUP BY u.department ORDER BY bookings DESC`
    );

    // Revenue over time (last 7 days)
    const [revenueOverTime] = await db.query(
      `SELECT DATE(booking_date) as date, COALESCE(SUM(total_price), 0) as revenue
       FROM bookings WHERE status = 'confirmed' AND booking_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(booking_date) ORDER BY date ASC`
    );

    // Category distribution
    const [categoryDist] = await db.query(
      `SELECT e.category, COUNT(b.booking_id) as bookings
       FROM events e LEFT JOIN bookings b ON e.event_id = b.event_id AND b.status = 'confirmed'
       WHERE e.status != 'archived' GROUP BY e.category`
    );

    // Most viewed events
    const [mostViewed] = await db.query(
      `SELECT e.title, ea.views, ea.engagement_score FROM events e 
       JOIN event_analytics ea ON e.event_id = ea.event_id 
       WHERE e.status != 'archived' ORDER BY ea.views DESC LIMIT 5`
    );

    res.json({
      stats: { total_events, total_bookings, total_revenue, total_tickets_remaining, avg_ticket_price: parseFloat(avg_ticket_price).toFixed(2), total_users },
      top_event: topEvent[0] || null,
      charts: { bookingsPerEvent, deptBookings, revenueOverTime, categoryDist },
      most_viewed: mostViewed
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

// Event analytics details
router.get('/events/:id', authenticateAdmin, async (req, res) => {
  try {
    const [analytics] = await db.query(
      `SELECT ea.*, e.title, e.total_tickets, e.available_tickets, e.price,
       (e.total_tickets - e.available_tickets) as tickets_sold
       FROM event_analytics ea JOIN events e ON ea.event_id = e.event_id
       WHERE ea.event_id = ?`,
      [req.params.id]
    );
    if (analytics.length === 0) return res.status(404).json({ message: 'Analytics not found' });
    res.json({ analytics: analytics[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

// All events analytics
router.get('/events', authenticateAdmin, async (req, res) => {
  try {
    const [analytics] = await db.query(
      `SELECT ea.*, e.title, e.category, e.total_tickets, e.available_tickets, e.price,
       (e.total_tickets - e.available_tickets) as tickets_sold,
       COALESCE((SELECT SUM(b.total_price) FROM bookings b WHERE b.event_id = e.event_id AND b.status = 'confirmed'), 0) as revenue
       FROM event_analytics ea JOIN events e ON ea.event_id = e.event_id
       WHERE e.status != 'archived' ORDER BY ea.engagement_score DESC`
    );
    res.json({ analytics });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

module.exports = router;
