const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/connection');
const { authenticateUser } = require('../middleware/auth');

// Setup multer for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(ok ? null : new Error('Only image files allowed'), ok);
  }
});

// GET /api/profile — Get current user's profile
router.get('/', authenticateUser, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT user_id, name, email, department, role, vtu_number, college, year_of_study,
              phone, bio, linkedin_url, github_url, profile_pic, created_at
       FROM users WHERE user_id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/profile — Update profile details
router.put('/', authenticateUser, async (req, res) => {
  try {
    const { name, department, vtu_number, college, year_of_study, phone, bio, linkedin_url, github_url } = req.body;
    await db.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        department = COALESCE(?, department),
        vtu_number = COALESCE(?, vtu_number),
        college = COALESCE(?, college),
        year_of_study = COALESCE(?, year_of_study),
        phone = COALESCE(?, phone),
        bio = COALESCE(?, bio),
        linkedin_url = COALESCE(?, linkedin_url),
        github_url = COALESCE(?, github_url)
       WHERE user_id = ?`,
      [name, department, vtu_number, college, year_of_study, phone, bio, linkedin_url, github_url, req.user.id]
    );

    const [rows] = await db.query(
      `SELECT user_id, name, email, department, role, vtu_number, college, year_of_study,
              phone, bio, linkedin_url, github_url, profile_pic, created_at
       FROM users WHERE user_id = ?`,
      [req.user.id]
    );

    // Update localStorage-compatible response
    const updated = rows[0];
    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/profile/picture — Upload profile picture
router.post('/picture', authenticateUser, upload.single('profile_pic'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image file provided' });
    const picUrl = `/uploads/profiles/${req.file.filename}`;
    await db.query('UPDATE users SET profile_pic = ? WHERE user_id = ?', [picUrl, req.user.id]);
    res.json({ message: 'Profile picture updated', profile_pic: picUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
