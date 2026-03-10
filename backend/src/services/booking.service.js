const bookingModel = require('../models/booking.model');

function getAvailableSlots(date) {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push({
      time: `${hour}:00`,
      available: true,
    });
  }
  return slots;
}

async function createBooking(bookingData) {
  const {
    serviceType,
    scheduledAt,
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = bookingData;

  if (!serviceType || !scheduledAt || !customerEmail) {
    throw new Error('Missing required booking fields');
  }

  const booking = await bookingModel.create({
    service_type: serviceType,
    scheduled_at: scheduledAt,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    notes,
    status: 'pending',
  });

  return booking;
}

async function getBooking(bookingId) {
  return await bookingModel.findById(bookingId);
}

async function getBookingsByEmail(email) {
  return await bookingModel.findByEmail(email);
}

module.exports = {
  getAvailableSlots,
  createBooking,
  getBooking,
  getBookingsByEmail,
};
