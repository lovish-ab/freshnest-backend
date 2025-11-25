const express = require('express');
const router = express.Router();
const { authenticate, isCustomer } = require('../middleware/auth');
const customerController = require('../controllers/customerController');


router.post('/orders', authenticate, isCustomer, customerController.placeOrder);

router.get('/cart', authenticate, isCustomer, customerController.getCart);

router.put('/cart/:id', authenticate, isCustomer, customerController.updateCart);

router.delete('/cart/:id', authenticate, isCustomer, customerController.clearCart);

router.get('/orders', authenticate, isCustomer, customerController.getOrders);

module.exports = router;

