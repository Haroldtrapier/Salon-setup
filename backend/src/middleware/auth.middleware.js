const crypto = require('crypto');
const config = require('../config/env');

function verifyShopifyWebhook(req, res, next) {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = JSON.stringify(req.body);

  const hash = crypto
    .createHmac('sha256', config.shopify.webhookSecret)
    .update(body, 'utf8')
    .digest('base64');

  if (hash === hmac) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid webhook signature' });
  }
}

module.exports = { verifyShopifyWebhook };
