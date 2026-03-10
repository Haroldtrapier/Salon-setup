const express = require('express');
const helmet = require('helmet');
const config = require('./config/env');
const corsMiddleware = require('./middleware/cors.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const chatRoutes = require('./routes/chat.routes');
const bookingRoutes = require('./routes/booking.routes');
const fitRoutes = require('./routes/fit.routes');
const shopifyRoutes = require('./routes/shopify.routes');

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.use('/api/chat', chatRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/fit', fitRoutes);
app.use('/api/shopify', shopifyRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use(errorMiddleware);

app.listen(config.port, () => {
  console.log('Salon Backend API');
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.port}/health`);
});

module.exports = app;
