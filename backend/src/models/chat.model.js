const pool = require('../config/database');

async function createSession(sessionId, customerEmail = null) {
  const result = await pool.query(
    `INSERT INTO chat_sessions (id, customer_email, messages)
     VALUES ($1, $2, ARRAY[]::JSONB[])
     RETURNING *`,
    [sessionId, customerEmail]
  );
  return result.rows[0];
}

async function getSession(sessionId) {
  const result = await pool.query(
    'SELECT * FROM chat_sessions WHERE id = $1',
    [sessionId]
  );
  return result.rows[0];
}

async function addMessages(sessionId, messages) {
  const jsonbMessages = messages.map(msg => JSON.stringify(msg));

  const result = await pool.query(
    `UPDATE chat_sessions 
     SET messages = messages || $1::jsonb[], updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [jsonbMessages, sessionId]
  );
  return result.rows[0];
}

module.exports = {
  createSession,
  getSession,
  addMessages,
};
