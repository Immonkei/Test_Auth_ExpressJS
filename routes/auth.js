const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const tokenStore = require('../models/tokenStore');

const router = express.Router();

const ACCESS_SECRET = 'access_secret_key';
const REFRESH_SECRET = 'refresh_secret_key';

const generateAccessToken = (user) => {
  return jwt.sign(user, ACCESS_SECRET, { expiresIn: '1m' });
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(user, REFRESH_SECRET, { expiresIn: '7d' });
  tokenStore.saveToken(token);
  return token;
};

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (results.length > 0) return res.status(400).json({ message: 'Username exists' });

    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], () => {
      res.status(201).json({ message: 'User registered' });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    const user = results[0];
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, username: user.username };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({ accessToken, refreshToken });
  });
});

// Refresh
router.post('/refresh', (req, res) => {
  const { token } = req.body;
  if (!token || !tokenStore.exists(token))
    return res.status(403).json({ message: 'Invalid refresh token' });

  try {
    const user = jwt.verify(token, REFRESH_SECRET);
    const accessToken = generateAccessToken({ id: user.id, username: user.username });
    res.json({ accessToken });
  } catch {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  const { token } = req.body;
  tokenStore.removeToken(token);
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
