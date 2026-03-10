const express = require('express');
const router = express.Router();
const bookingService = require('../services/booking.service');

router.get('/availability', async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }

    const slots = bookingService.getAvailableSlots(date);
    res.json({ slots });
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (req, res, next) => {
  try {
    const bookingData = req.body;
    const booking = await bookingService.createBooking(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBooking(id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
});

router.get('/customer/:email', async (req, res, next) => {
  try {
    const { email } = req.params;
    const bookings = await bookingService.getBookingsByEmail(email);
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
