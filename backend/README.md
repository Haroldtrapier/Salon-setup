# Salon Backend API

Express.js backend for the Salon platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values:
   ```bash
   cp .env.example .env
   ```

3. Run migrations:
   ```bash
   npm run migrate
   ```

4. Start server:
   ```bash
   npm start
   ```

## Development

```bash
npm run dev
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat/message` - Chat with bot
- `GET /api/booking/availability?date=YYYY-MM-DD` - Get available slots
- `POST /api/booking/create` - Create booking
- `GET /api/booking/:id` - Get booking by ID
- `GET /api/booking/customer/:email` - Get bookings by email
- `POST /api/fit/upload` - Upload nail photos (Phase 2)
- `GET /api/fit/profile/:customerId` - Get fit profile (Phase 2)
- `POST /api/shopify/webhook/order-created` - Shopify order webhook
- `POST /api/shopify/webhook/customer-created` - Shopify customer webhook

## Environment Variables

See `.env.example` for all required variables.

## Deployment (Railway)

1. Connect GitHub repo to Railway
2. Add PostgreSQL database
3. Set environment variables
4. Deploy from GitHub
5. Run migrations: `railway run npm run migrate`
6. Generate public domain
