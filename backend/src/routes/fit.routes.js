const express = require('express');
const router = express.Router();

router.post('/upload', async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Custom fit feature coming in Phase 2' });
  } catch (error) {
    next(error);
  }
});

router.get('/profile/:customerId', async (req, res, next) => {
  try {
    res.status(501).json({ message: 'Custom fit feature coming in Phase 2' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
