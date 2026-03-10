# Cursor Agent Brief - Build Railway Backend

> Complete instructions for building the Salon platform backend API

## 🎯 Mission

Build a production-ready Express.js backend API for Railway that handles:
- Chatbot logic with OpenAI integration
- Appointment booking system
- Customer profile extensions
- Shopify webhook handlers
- PostgreSQL database integration

---

## 📁 Project Structure

Create this exact folder structure:

```
backend/
├── src/
│   ├── index.js                 # Main server entry
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   └── env.js               # Environment config
│   ├── routes/
│   │   ├── chat.routes.js       # Chatbot endpoints
│   │   ├── booking.routes.js    # Booking endpoints
│   │   ├── fit.routes.js        # Custom fit endpoints
│   │   └── shopify.routes.js    # Webhook endpoints
│   ├── services/
│   │   ├── chatbot.service.js   # OpenAI logic
│   │   ├── booking.service.js   # Booking logic
│   │   └── shopify.service.js   # Shopify integration
│   ├── models/
│   │   ├── customer.model.js    # Customer queries
│   │   ├── booking.model.js     # Booking queries
│   │   └── chat.model.js        # Chat queries
│   └── middleware/
│       ├── cors.middleware.js   # CORS config
│       ├── error.middleware.js  # Error handling
│       └── auth.middleware.js   # Webhook verification
├── migrations/
│   ├── 001_initial_schema.sql   # Database schema
│   └── run.js                   # Migration runner
├── .env.example                 # Example env file
├── package.json                 # Dependencies
├── .gitignore                   # Git ignore
└── README.md                    # Backend docs
```

---

## 📦 package.json

Create `backend/package.json`:

```json
{
  "name": "salon-backend",
  "version": "1.0.0",
  "description": "Backend API for Salon platform",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "migrate": "node migrations/run.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "openai": "^4.20.1",
    "@shopify/shopify-api": "^7.7.0",
    "crypto": "^1.0.1",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 🗄️ Database Schema

Create `backend/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Customer profiles extension
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id BIGINT UNIQUE,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  fit_profile_id UUID,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fit profiles (Phase 2)
CREATE TABLE IF NOT EXISTS fit_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
  measurements JSONB,
  scan_images TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customer_profiles(id),
  service_type VARCHAR(100) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'pending',
  customer_name VARCHAR(255),
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  customer_email VARCHAR(255),
  messages JSONB[] DEFAULT ARRAY[]::JSONB[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_shopify_id ON customer_profiles(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_customer ON chat_sessions(customer_id);
```

---

## 🔧 Configuration Files

### `backend/.env.example`

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/salon_db

# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your-api-key
SHOPIFY_API_SECRET=your-api-secret
SHOPIFY_STOREFRONT_TOKEN=your-storefront-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
JWT_SECRET=your-jwt-secret-key-change-in-production
```

### `backend/src/config/env.js`

```javascript
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
```

### `backend/src/config/database.js`

```javascript
const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

module.exports = pool;
```

---

## 🚀 Main Server File

### `backend/src/index.js`

```javascript
const express = require('express');
const helmet = require('helmet');
const config = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');
const errorMiddleware = require('./middleware/error.middleware');

// Route imports
const chatRoutes = require('./routes/chat.routes');
const bookingRoutes = require('./routes/booking.routes');
const fitRoutes = require('./routes/fit.routes');
const shopifyRoutes = require('./routes/shopify.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(corsMiddleware);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/fit', fitRoutes);
app.use('/api/shopify', shopifyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling
app.use(errorMiddleware);

// Start server
app.listen(config.port, () => {
  console.log('✅ Salon Backend API');
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${config.port}/health`);
});

module.exports = app;
```

---

## 🛡️ Middleware

### `backend/src/middleware/cors.middleware.js`

```javascript
const cors = require('cors');
const config = require('../config/env');

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  config.frontend.url,
];

module.exports = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || config.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

### `backend/src/middleware/error.middleware.js`

```javascript
module.exports = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### `backend/src/middleware/auth.middleware.js`

```javascript
const crypto = require('crypto');
const config = require('../config/env');

// Verify Shopify webhook signature
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
```

---

## 🗣️ Chatbot Service

### `backend/src/services/chatbot.service.js`

```javascript
const OpenAI = require('openai');
const config = require('../config/env');
const chatModel = require('../models/chat.model');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

const SYSTEM_PROMPT = `You are a helpful assistant for a premium beauty brand specializing in custom-fit press-on nails.

Your role:
- Help customers find the perfect nail sets
- Explain the custom fit technology
- Provide styling advice
- Answer questions about products, shipping, and returns
- Guide customers to book appointments

Brand voice: Friendly, knowledgeable, premium but approachable.

Available services:
- Custom nail sets (various shapes: almond, coffin, square, stiletto)
- Custom fitting service
- In-person salon appointments

Shipping: 3-5 business days
Returns: 30-day return policy

Keep responses concise and helpful.`;

const FUNCTIONS = [
  {
    name: 'book_appointment',
    description: 'Help customer book a salon appointment',
    parameters: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          description: 'Type of service requested',
        },
        preferred_date: {
          type: 'string',
          description: 'Preferred appointment date',
        },
      },
    },
  },
];

async function chat(message, sessionId, customerEmail = null) {
  try {
    // Get or create session
    let session = await chatModel.getSession(sessionId);
    if (!session) {
      session = await chatModel.createSession(sessionId, customerEmail);
    }

    // Build message history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      functions: FUNCTIONS,
      function_call: 'auto',
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0].message;

    // Handle function calls
    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const args = JSON.parse(assistantMessage.function_call.arguments);

      if (functionName === 'book_appointment') {
        return {
          message: `I'd be happy to help you book an appointment! Please visit our booking page to select your preferred time: ${config.frontend.url}/book`,
          action: 'redirect',
          url: `${config.frontend.url}/book`,
        };
      }
    }

    const reply = assistantMessage.content;

    // Save messages to session
    await chatModel.addMessages(sessionId, [
      { role: 'user', content: message },
      { role: 'assistant', content: reply },
    ]);

    return {
      message: reply,
      sessionId,
    };
  } catch (error) {
    console.error('Chatbot error:', error);
    throw new Error('Failed to process message');
  }
}

module.exports = { chat };
```

---

## 📅 Booking Service

### `backend/src/services/booking.service.js`

```javascript
const bookingModel = require('../models/booking.model');

// Get available time slots for a date
function getAvailableSlots(date) {
  // Simple implementation - return hourly slots 9am-5pm
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push({
      time: `${hour}:00`,
      available: true, // TODO: Check against existing bookings
    });
  }
  return slots;
}

// Create a new booking
async function createBooking(bookingData) {
  const {
    serviceType,
    scheduledAt,
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = bookingData;

  // Validate required fields
  if (!serviceType || !scheduledAt || !customerEmail) {
    throw new Error('Missing required booking fields');
  }

  // Create booking
  const booking = await bookingModel.create({
    service_type: serviceType,
    scheduled_at: scheduledAt,
    customer_name: customerName,
    customer_email: customerEmail,
    customer_phone: customerPhone,
    notes,
    status: 'pending',
  });

  // TODO: Send confirmation email

  return booking;
}

// Get booking by ID
async function getBooking(bookingId) {
  return await bookingModel.findById(bookingId);
}

// Get bookings by email
async function getBookingsByEmail(email) {
  return await bookingModel.findByEmail(email);
}

module.exports = {
  getAvailableSlots,
  createBooking,
  getBooking,
  getBookingsByEmail,
};
```

---

## 🏪 Shopify Service

### `backend/src/services/shopify.service.js`

```javascript
const customerModel = require('../models/customer.model');

// Handle order created webhook
async function handleOrderCreated(orderData) {
  console.log('Order created:', orderData.id);

  try {
    // Extract customer info
    const { customer, line_items, note_attributes } = orderData;

    if (customer) {
      // Create or update customer profile
      await customerModel.upsert({
        shopify_customer_id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
      });

      // Check for custom fit data in order notes
      const fitProfileId = note_attributes?.find(
        attr => attr.name === 'fit_profile_id'
      )?.value;

      if (fitProfileId) {
        // Link fit profile to order
        console.log('Order has custom fit profile:', fitProfileId);
        // TODO: Store order-fit association
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error handling order:', error);
    throw error;
  }
}

// Handle customer created webhook
async function handleCustomerCreated(customerData) {
  console.log('Customer created:', customerData.id);

  try {
    await customerModel.upsert({
      shopify_customer_id: customerData.id,
      email: customerData.email,
      first_name: customerData.first_name,
      last_name: customerData.last_name,
      phone: customerData.phone,
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

module.exports = {
  handleOrderCreated,
  handleCustomerCreated,
};
```

---

## 📊 Database Models

### `backend/src/models/customer.model.js`

```javascript
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
```

### `backend/src/models/booking.model.js`

```javascript
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
```

### `backend/src/models/chat.model.js`

```javascript
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
```

---

## 🛣️ Routes

### `backend/src/routes/chat.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const chatService = require('../services/chatbot.service');

// Send message to chatbot
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
```

### `backend/src/routes/booking.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const bookingService = require('../services/booking.service');

// Get available time slots
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

// Create new booking
router.post('/create', async (req, res, next) => {
  try {
    const bookingData = req.body;
    const booking = await bookingService.createBooking(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
});

// Get booking by ID
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

// Get bookings by email
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
```

### `backend/src/routes/fit.routes.js`

```javascript
const express = require('express');
const router = express.Router();

// Phase 2: Custom fit endpoints

// Upload nail photos
router.post('/upload', async (req, res, next) => {
  try {
    // TODO: Implement in Phase 2
    res.status(501).json({ message: 'Custom fit feature coming in Phase 2' });
  } catch (error) {
    next(error);
  }
});

// Get fit profile
router.get('/profile/:customerId', async (req, res, next) => {
  try {
    // TODO: Implement in Phase 2
    res.status(501).json({ message: 'Custom fit feature coming in Phase 2' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### `backend/src/routes/shopify.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { verifyShopifyWebhook } = require('../middleware/auth.middleware');
const shopifyService = require('../services/shopify.service');

// Order created webhook
router.post('/webhook/order-created', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    // Note: Webhook verification should be done with raw body
    const orderData = req.body;
    await shopifyService.handleOrderCreated(orderData);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order webhook error:', error);
    res.status(500).send('Error');
  }
});

// Customer created webhook
router.post('/webhook/customer-created', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const customerData = req.body;
    await shopifyService.handleCustomerCreated(customerData);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Customer webhook error:', error);
    res.status(500).send('Error');
  }
});

module.exports = router;
```

---

## 🔄 Migration Runner

### `backend/migrations/run.js`

```javascript
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    const sqlPath = path.join(__dirname, '001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
```

---

## 📝 Additional Files

### `backend/.gitignore`

```
node_modules/
.env
.env.local
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log
.vscode/
.idea/
```

### `backend/README.md`

```markdown
# Salon Backend API

Express.js backend for the Salon platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values

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
- `GET /api/booking/availability` - Get available slots
- `POST /api/booking/create` - Create booking
- `GET /api/booking/:id` - Get booking
- `POST /api/shopify/webhook/*` - Shopify webhooks
```

---

## ✅ Final Checklist for Cursor

1. Create `backend/` folder in project root
2. Create all files exactly as specified above
3. Run `npm install` in backend folder
4. Create `.env` file from `.env.example`
5. Ensure all imports are correct
6. Test server starts with `npm start`
7. Verify all routes respond
8. Ready to deploy to Railway

---

## 🚀 Deploy to Railway

After building:

1. Push backend folder to GitHub
2. Create Railway project
3. Add PostgreSQL database
4. Set environment variables
5. Deploy from GitHub
6. Run migrations: `railway run npm run migrate`
7. Generate public domain
8. Test endpoints

---

**That's everything! Cursor should be able to build this entire backend from this spec.**