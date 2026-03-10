const pool = require('../config/database');

async function create(bookingData) {
  const {
    service_type,
    scheduled_at,
    duration_minutes = 60,
    status = 'pending',
    customer_name,
    customer_email,
    customer_phone,
    notes,
  } = bookingData;

  const result = await pool.query(
    `INSERT INTO bookings 
      (service_type, scheduled_at, duration_minutes, status, 
       customer_name, customer_email, customer_phone, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      service_type,
      scheduled_at,
      duration_minutes,
      status,
      customer_name,
      customer_email,
      customer_phone,
      notes,
    ]
  );
  return result.rows[0];
}

async function findById(id) {
  const result = await pool.query(
    'SELECT * FROM bookings WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM bookings WHERE customer_email = $1 ORDER BY scheduled_at DESC',
    [email]
  );
  return result.rows;
}

async function updateStatus(id, status) {
  const result = await pool.query(
    'UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
}

module.exports = {
  create,
  findById,
  findByEmail,
  updateStatus,
};
