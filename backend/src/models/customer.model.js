const pool = require('../config/database');

async function findByShopifyId(shopifyId) {
  const result = await pool.query(
    'SELECT * FROM customer_profiles WHERE shopify_customer_id = $1',
    [shopifyId]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM customer_profiles WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

async function upsert(customerData) {
  const {
    shopify_customer_id,
    email,
    first_name,
    last_name,
    phone,
  } = customerData;

  const result = await pool.query(
    `INSERT INTO customer_profiles 
      (shopify_customer_id, email, first_name, last_name, phone, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (shopify_customer_id) 
     DO UPDATE SET 
       email = EXCLUDED.email,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       phone = EXCLUDED.phone,
       updated_at = NOW()
     RETURNING *`,
    [shopify_customer_id, email, first_name, last_name, phone]
  );
  return result.rows[0];
}

module.exports = {
  findByShopifyId,
  findByEmail,
  upsert,
};
