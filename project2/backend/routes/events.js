const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer setup for poster uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/posters');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `poster_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET all events (with filters)
router.get('/', async (req, res) => {
  try {
    const { search, category, department, date_from, date_to, min_price, max_price, sort } = req.query;
    let query = 'SELECT e.*, ea.views, ea.engagement_score FROM events e LEFT JOIN event_analytics ea ON e.event_id = ea.event_id WHERE e.status != "archived"';
    const params = [];

    if (search) { query += ' AND (e.title LIKE ? OR e.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (category) { query += ' AND e.category = ?'; params.push(category); }
    if (department) { query += ' AND e.department = ?'; params.push(department); }
    if (date_from) { query += ' AND e.event_date >= ?'; params.push(date_from); }
    if (date_to) { query += ' AND e.event_date <= ?'; params.push(date_to); }
    if (min_price !== undefined) { query += ' AND e.price >= ?'; params.push(min_price); }
    if (max_price !== undefined) { query += ' AND e.price <= ?'; params.push(max_price); }

    const sortMap = {
      popularity: 'ea.engagement_score DESC',
      date_asc: 'e.event_date ASC',
      date_desc: 'e.event_date DESC',
      price_asc: 'e.price ASC',
      price_desc: 'e.price DESC',
    };
    query += ` ORDER BY ${sortMap[sort] || 'e.created_at DESC'}`;

    const [events] = await db.query(query, params);
    res.json({ events });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
});

// GET single event
router.get('/:id', async (req, res) => {
  try {
    const [events] = await db.query(
      'SELECT e.*, ea.views, ea.bookings as analytics_bookings, ea.engagement_score FROM events e LEFT JOIN event_analytics ea ON e.event_id = ea.event_id WHERE e.event_id = ?',
      [req.params.id]
    );
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });

    // Increment view count
    await db.query('UPDATE event_analytics SET views = views + 1, engagement_score = ROUND((views * 0.3 + bookings * 0.7) / 10, 2) WHERE event_id = ?', [req.params.id]);

    res.json({ event: events[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching event', error: err.message });
  }
});

// CREATE event (Admin)
router.post('/', authenticateAdmin, upload.single('poster'), async (req, res) => {
  try {
    const { title, department, description, venue, event_date, event_time, price, total_tickets, category, tags, status, difficulty_level } = req.body;
    if (!title || !event_date || !event_time || !total_tickets) return res.status(400).json({ message: 'Required fields missing' });

    const poster_url = req.file ? `/uploads/posters/${req.file.filename}` : null;
    const [result] = await db.query(
      'INSERT INTO events (title, department, description, venue, event_date, event_time, price, total_tickets, available_tickets, category, tags, poster_url, status, difficulty_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, department, description, venue, event_date, event_time, price || 0, total_tickets, total_tickets, category, tags ? JSON.stringify(JSON.parse(tags)) : null, poster_url, status || 'active', difficulty_level || 'Beginner']
    );

    // Create analytics record
    await db.query('INSERT INTO event_analytics (event_id) VALUES (?)', [result.insertId]);

    res.status(201).json({ message: 'Event created', event_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
});

// UPDATE event (Admin)
router.put('/:id', authenticateAdmin, upload.single('poster'), async (req, res) => {
  try {
    const { title, department, description, venue, event_date, event_time, price, total_tickets, available_tickets, category, tags, status, difficulty_level } = req.body;
    const poster_url = req.file ? `/uploads/posters/${req.file.filename}` : undefined;

    let query = 'UPDATE events SET title=?, department=?, description=?, venue=?, event_date=?, event_time=?, price=?, total_tickets=?, available_tickets=?, category=?, tags=?, status=?, difficulty_level=?';
    const params = [title, department, description, venue, event_date, event_time, price, total_tickets, available_tickets, category, tags ? JSON.stringify(JSON.parse(tags)) : null, status, difficulty_level];

    if (poster_url) { query += ', poster_url=?'; params.push(poster_url); }
    query += ' WHERE event_id=?';
    params.push(req.params.id);

    await db.query(query, params);
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating event', error: err.message });
  }
});

// DELETE event (Admin)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await db.query('UPDATE events SET status = "archived" WHERE event_id = ?', [req.params.id]);
    res.json({ message: 'Event archived successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
});

// CLONE event (Admin)
router.post('/:id/clone', authenticateAdmin, async (req, res) => {
  try {
    const [events] = await db.query('SELECT * FROM events WHERE event_id = ?', [req.params.id]);
    if (events.length === 0) return res.status(404).json({ message: 'Event not found' });

    const e = events[0];
    const [result] = await db.query(
      'INSERT INTO events (title, department, description, venue, event_date, event_time, price, total_tickets, available_tickets, category, tags, poster_url, status, difficulty_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`[Copy] ${e.title}`, e.department, e.description, e.venue, e.event_date, e.event_time, e.price, e.total_tickets, e.total_tickets, e.category, typeof e.tags === 'string' ? e.tags : JSON.stringify(e.tags || []), e.poster_url, 'inactive', e.difficulty_level]
    );
    await db.query('INSERT INTO event_analytics (event_id) VALUES (?)', [result.insertId]);
    res.json({ message: 'Event cloned', event_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Error cloning event', error: err.message });
  }
});

// Bulk upload via CSV (Admin)
router.post('/bulk-upload', authenticateAdmin, async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) return res.status(400).json({ message: 'Invalid data' });

    let created = 0;
    for (const e of events) {
      const [result] = await db.query(
        'INSERT INTO events (title, department, description, venue, event_date, event_time, price, total_tickets, available_tickets, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [e.title, e.department, e.description, e.venue, e.event_date, e.event_time, e.price || 0, e.total_tickets || 100, e.total_tickets || 100, e.category, 'active']
      );
      await db.query('INSERT INTO event_analytics (event_id) VALUES (?)', [result.insertId]);
      created++;
    }
    res.json({ message: `${created} events created successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Bulk upload failed', error: err.message });
  }
});

module.exports = router;
