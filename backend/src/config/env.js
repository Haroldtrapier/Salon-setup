require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  shopify: {
    domain: process.env.SHOPIFY_STORE_DOMAIN,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecret: process.env.SHOPIFY_API_SECRET,
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN,
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  jwtSecret: process.env.JWT_SECRET,
};
