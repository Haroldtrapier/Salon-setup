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

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Database connected at:', res.rows[0].now);
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== HEALTH & STATUS ====================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'salon-backend'
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: dbResult.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// ==================== CHATBOT ENDPOINTS ====================

app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // TODO: Implement OpenAI integration
    // For now, return a placeholder response
    const response = {
      response: `Thank you for your message: "${message}". Our chatbot is being configured. How can I help you with our custom nail sets?`,
      sessionId: sessionId || generateSessionId(),
      timestamp: new Date().toISOString()
    };

    // Store chat message in database
    if (sessionId) {
      await pool.query(
        `INSERT INTO chat_sessions (id, messages, updated_at) 
         VALUES ($1, ARRAY[$2::jsonb], NOW()) 
         ON CONFLICT (id) DO UPDATE 
         SET messages = array_append(chat_sessions.messages, $2::jsonb),
             updated_at = NOW()`,
        [sessionId, JSON.stringify({ role: 'user', content: message, timestamp: new Date() })]
      );
    }

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

app.get('/api/chat/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const result = await pool.query(
      'SELECT messages FROM chat_sessions WHERE id = $1',
      [sessionId]
    );

    if (result.rows.length === 0) {
      return res.json({ messages: [] });
    }

    res.json({ messages: result.rows[0].messages || [] });
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// ==================== BOOKING ENDPOINTS ====================

app.get('/api/booking/availability', async (req, res) => {
  try {
    const { date, service } = req.query;
    
    // TODO: Implement actual availability logic
    // For now, return sample time slots
    const slots = [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true }
    ];

    res.json({ date, service, slots });
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.post('/api/booking/create', async (req, res) => {
  try {
    const { 
      service, 
      scheduled_at, 
      customer_name, 
      customer_email, 
      customer_phone, 
      notes 
    } = req.body;

    // Validation
    if (!service || !scheduled_at || !customer_name || !customer_email) {
      return res.status(400).json({ 
        error: 'Missing required fields: service, scheduled_at, customer_name, customer_email' 
      });
    }

    // Insert booking
    const result = await pool.query(
      `INSERT INTO bookings 
       (service_type, scheduled_at, customer_name, customer_email, customer_phone, notes, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING id, created_at`,
      [service, scheduled_at, customer_name, customer_email, customer_phone, notes]
    );

    const booking = result.rows[0];

    res.status(201).json({
      success: true,
      bookingId: booking.id,
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        service,
        scheduled_at,
        customer_name,
        customer_email,
        status: 'pending',
        created_at: booking.created_at
      }
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

app.get('/api/booking/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Booking retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve booking' });
  }
});

// ==================== SHOPIFY WEBHOOKS ====================

app.post('/api/shopify/webhook/order-created', async (req, res) => {
  try {
    // TODO: Verify Shopify webhook signature
    const order = req.body;
    
    console.log('📦 New order received:', order.id || order.order_number);
    
    // TODO: Process order (send confirmation, update database, etc.)
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.post('/api/shopify/webhook/order-updated', async (req, res) => {
  try {
    const order = req.body;
    console.log('🔄 Order updated:', order.id || order.order_number);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order update webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

app.post('/api/shopify/webhook/customer-created', async (req, res) => {
  try {
    const customer = req.body;
    
    console.log('👤 New customer:', customer.email);
    
    // Store customer profile
    await pool.query(
      `INSERT INTO customer_profiles (shopify_customer_id, email) 
       VALUES ($1, $2) 
       ON CONFLICT (shopify_customer_id) DO NOTHING`,
      [customer.id, customer.email]
    );
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Customer webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ==================== CUSTOM FIT (Phase 2) ====================

app.post('/api/fit/upload', async (req, res) => {
  try {
    // TODO: Implement image upload and processing
    res.status(501).json({ 
      message: 'Custom fit upload will be available in Phase 2',
      status: 'coming_soon'
    });
  } catch (error) {
    console.error('Fit upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/fit/profile/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const result = await pool.query(
      `SELECT fp.* FROM fit_profiles fp
       JOIN customer_profiles cp ON fp.customer_id = cp.id
       WHERE cp.id = $1`,
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fit profile not found' });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Fit profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve fit profile' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// ==================== SERVER START ====================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ====================================');
  console.log(`   Salon Backend API`);
  console.log('   ====================================');
  console.log(`   ✅ Server running on port ${PORT}`);
  console.log(`   🔗 Health: http://localhost:${PORT}/health`);
  console.log(`   📊 Status: http://localhost:${PORT}/api/status`);
  console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   ====================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});

// Helper functions
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

module.exports = app;