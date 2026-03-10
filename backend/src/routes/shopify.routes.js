const express = require('express');
const router = express.Router();
const shopifyService = require('../services/shopify.service');

router.post('/webhook/order-created', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const orderData = req.body;
    await shopifyService.handleOrderCreated(orderData);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Order webhook error:', error);
    res.status(500).send('Error');
  }
});

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
