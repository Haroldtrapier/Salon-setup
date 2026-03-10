const express = require('express');
const router = express.Router();
const chatService = require('../services/chatbot.service');

router.post('/message', async (req, res, next) => {
  try {
    const { message, sessionId, customerEmail } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'Message and sessionId required' });
    }

    const response = await chatService.chat(message, sessionId, customerEmail);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
