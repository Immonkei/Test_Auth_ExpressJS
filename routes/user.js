const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /profile
router.get('/profile', authMiddleware('access_secret_key'), (req, res) => {
  db.query('SELECT id, username FROM users WHERE id = ?', [req.user.id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(results[0]);
  });
});

module.exports = router;
