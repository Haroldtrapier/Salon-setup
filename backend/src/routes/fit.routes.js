const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// Save nail profile
router.post('/profile', async (req, res, next) => {
  try {
    const { measurements, hand_type, reference_object, confidence, notes } = req.body;

    // Insert profile
    const result = await pool.query(
      `INSERT INTO nail_profiles (measurements, hand_type, reference_object, confidence, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, created_at`,
      [JSON.stringify(measurements), hand_type, reference_object, confidence, notes]
    );

    res.json({
      profile_id: result.rows[0].id,
      created_at: result.rows[0].created_at,
      message: 'Nail profile saved successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get profile by ID
router.get('/profile/:profileId', async (req, res, next) => {
  try {
    const { profileId } = req.params;

    const result = await pool.query(
      `SELECT id, measurements, hand_type, reference_object, confidence, notes, created_at
       FROM nail_profiles
       WHERE id = $1`,
      [profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get all profiles (for admin/testing)
router.get('/profiles', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, measurements, hand_type, confidence, created_at
       FROM nail_profiles
       ORDER BY created_at DESC
       LIMIT 50`
    );

    res.json({ profiles: result.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;