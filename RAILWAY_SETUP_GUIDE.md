# Railway Setup Guide - Complete Walkthrough

> Step-by-step guide to set up Railway backend for the Salon platform

## 🎯 What Railway Does in This Project

Railway hosts your **backend API** that handles:
- Chatbot logic (OpenAI integration)
- Appointment booking system
- Custom nail fit processing (Phase 2)
- Customer profile extensions
- Shopify webhook handlers
- Database for custom data

---

## 📋 Prerequisites

- GitHub account
- Credit card (for Railway - has free tier)
- Basic familiarity with APIs

---

## Step 1: Create Railway Account

### Sign Up
1. Go to [railway.app](https://railway.app)
2. Click **Login** → **Login with GitHub**
3. Authorize Railway to access your GitHub
4. Complete onboarding

### Free Tier
- **$5 free credits per month**
- No credit card required initially
- Enough for development and testing
- Upgrade when you go to production

---

## Step 2: Create Your Backend Project

### Option A: Deploy Empty Project (Recommended for now)

1. **Create New Project**
   - Click **New Project** on Railway dashboard
   - Select **Deploy from GitHub repo** or **Empty Project**
   - Name it: `salon-backend`

2. **Add PostgreSQL Database**
   - In your project, click **New**
   - Select **Database** → **Add PostgreSQL**
   - Railway provisions a database automatically
   - Note: Takes 1-2 minutes

3. **Get Database Credentials**
   - Click on the PostgreSQL service
   - Go to **Variables** tab
   - Copy these values:
     ```
     DATABASE_URL (full connection string)
     PGHOST
     PGPORT
     PGUSER
     PGPASSWORD
     PGDATABASE
     ```

### Option B: Deploy from GitHub (When backend code is ready)

1. **Push Backend Code to GitHub**
   ```bash
   # Create backend folder
   mkdir backend
   cd backend
   
   # Initialize Node.js project
   npm init -y
   npm install express cors dotenv pg @shopify/shopify-api openai
   
   # Create basic server.js
   # (See code example below)
   
   # Push to GitHub
   git add .
   git commit -m "Initial backend"
   git push
   ```

2. **Deploy to Railway**
   - In Railway, click **New** → **GitHub Repo**
   - Select `Haroldtrapier/Salon-setup`
   - Choose the `backend` folder if using monorepo
   - Railway auto-detects Node.js and deploys

---

## Step 3: Configure Your Backend Service

### Add Environment Variables

In Railway project → Your service → **Variables** tab:

```env
# Database (auto-populated if you added PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your-api-key
SHOPIFY_API_SECRET=your-api-secret
SHOPIFY_STOREFRONT_TOKEN=your-storefront-token
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-site.vercel.app

# Node Environment
NODE_ENV=production
PORT=3000
```

### Railway Variable Syntax
- `${{Postgres.DATABASE_URL}}` - References another service's variable
- Railway automatically connects services this way

---

## Step 4: Basic Backend Code Structure

### Minimal Express Server Example

Create `backend/server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Chatbot endpoint
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // TODO: Implement OpenAI logic
    res.json({
      response: 'Chatbot response here',
      sessionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Booking endpoints
app.get('/api/booking/availability', async (req, res) => {
  // TODO: Implement availability logic
  res.json({ slots: [] });
});

app.post('/api/booking/create', async (req, res) => {
  // TODO: Implement booking creation
  res.json({ bookingId: 'temp-id' });
});

// Shopify webhook handler
app.post('/api/shopify/webhook/order-created', async (req, res) => {
  // TODO: Verify webhook signature
  // TODO: Process order
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
```

### Package.json

Create `backend/package.json`:

```json
{
  "name": "salon-backend",
  "version": "1.0.0",
  "description": "Backend API for Salon platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node migrations/run.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "@shopify/shopify-api": "^7.7.0",
    "openai": "^4.20.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## Step 5: Database Setup

### Create Tables

Create `backend/migrations/001_initial_schema.sql`:

```sql
-- Customer profiles extension
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id BIGINT UNIQUE,
  email VARCHAR(255),
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
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID,
  messages JSONB[] DEFAULT ARRAY[]::JSONB[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_shopify_id ON customer_profiles(shopify_customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
```

### Run Migrations

Create `backend/migrations/run.js`:

```javascript
const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    
    const sql = fs.readFileSync('./migrations/001_initial_schema.sql', 'utf8');
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

### Run from Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run migrate
```

---

## Step 6: Deploy Your Backend

### Automatic Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add backend/
   git commit -m "Add backend API"
   git push origin main
   ```

2. **Railway Auto-Deploys**
   - Railway watches your repo
   - Automatically builds on push
   - Takes 2-3 minutes

3. **Check Deployment**
   - Go to Railway dashboard
   - Click on your service
   - View **Deployments** tab
   - Check logs for errors

### Manual Deployment via CLI

```bash
# From backend folder
cd backend

# Deploy
railway up
```

---

## Step 7: Get Your Public URL

### Generate Domain

1. In Railway → Your service → **Settings**
2. Scroll to **Networking**
3. Click **Generate Domain**
4. Railway creates: `your-service.up.railway.app`

### Test Your API

```bash
# Health check
curl https://your-service.up.railway.app/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-03-10T11:00:00.000Z"
}
```

### Custom Domain (Optional)

1. In Railway → **Settings** → **Networking**
2. Click **Custom Domain**
3. Add: `api.yourdomain.com`
4. Update your DNS with provided CNAME:
   ```
   api.yourdomain.com → CNAME → your-service.up.railway.app
   ```

---

## Step 8: Connect to Vercel Frontend

### Update Vercel Environment Variables

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://your-service.up.railway.app
   ```
3. Redeploy Vercel site

### Test Connection

In your Next.js app:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function healthCheck() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

export async function sendChatMessage(message: string, sessionId: string) {
  const response = await fetch(`${API_URL}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId })
  });
  return response.json();
}
```

---

## Step 9: Set Up Shopify Webhooks

### Configure Webhooks in Shopify

1. **Go to Shopify Admin**
   - Settings → Notifications → Webhooks

2. **Create Webhooks**
   - **Order creation**:
     - Event: `Order creation`
     - URL: `https://your-service.up.railway.app/api/shopify/webhook/order-created`
     - Format: JSON
   
   - **Order update**:
     - Event: `Order update`
     - URL: `https://your-service.up.railway.app/api/shopify/webhook/order-updated`
     - Format: JSON
   
   - **Customer creation**:
     - Event: `Customer creation`
     - URL: `https://your-service.up.railway.app/api/shopify/webhook/customer-created`
     - Format: JSON

3. **Test Webhooks**
   - Create a test order in Shopify
   - Check Railway logs for webhook receipt

---

## Step 10: Monitoring & Debugging

### View Logs

**In Railway Dashboard:**
1. Click on your service
2. Go to **Deployments** tab
3. Click on latest deployment
4. View real-time logs

**Via CLI:**
```bash
railway logs
```

### Common Issues

**Database connection fails:**
```javascript
// Make sure SSL is configured for production
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // Required for Railway Postgres
  }
});
```

**CORS errors:**
```javascript
// Update CORS settings
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-site.vercel.app',
    process.env.FRONTEND_URL
  ],
  credentials: true
}));
```

**Port issues:**
```javascript
// Railway provides PORT via environment
const PORT = process.env.PORT || 3000;
```

### Metrics

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request logs
- Error tracking

Access via **Metrics** tab in service

---

## 💰 Pricing & Scaling

### Free Tier
- $5 in credits/month
- Good for development
- ~500 hours of uptime

### Paid Plans
- **Hobby**: $5/month + usage
- **Pro**: $20/month + usage
- Pay only for what you use

### Usage Costs
- Compute: ~$0.000231/min
- Memory: ~$0.000231/GB/min
- Postgres: ~$0.02/GB/month

**Typical costs for this project:**
- Development: Free tier sufficient
- Production (low traffic): $10-20/month
- Production (growth): $30-50/month

---

## ✅ Checklist

- [ ] Railway account created
- [ ] Project created
- [ ] PostgreSQL database added
- [ ] Environment variables configured
- [ ] Backend code deployed
- [ ] Database migrations run
- [ ] Public domain generated
- [ ] Health check endpoint working
- [ ] CORS configured for Vercel
- [ ] Shopify webhooks configured
- [ ] Logs monitored
- [ ] Frontend connected successfully

---

## 🔗 Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [PostgreSQL on Railway](https://docs.railway.app/databases/postgresql)
- [Railway Templates](https://railway.app/templates)

---

## 🆘 Getting Help

**Railway Support:**
- [Discord Community](https://discord.gg/railway)
- [Help Center](https://help.railway.app)
- [GitHub Issues](https://github.com/railwayapp/railway)

**Project-Specific:**
- Check deployment logs
- Test endpoints with Postman
- Review environment variables
- Check database connection

---

**Your Railway backend is now ready to power your salon platform!** 🚂✨