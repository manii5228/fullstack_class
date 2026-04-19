const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/profile', require('./routes/profile'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'EventBook API Running 🚀' }));

// Serve frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 EventBook API running on port ${PORT}`));

module.exports = app;
