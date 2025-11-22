const express = require('express');
const router = express.Router();
const { authenticate, isCustomer } = require('../middleware/auth');
const customerController = require('../controllers/customerController');

router.get('/profile', authenticate, isCustomer, customerController.getProfile);

router.put('/profile', authenticate, isCustomer, customerController.updateProfile);

router.get('/addresses', authenticate, isCustomer, customerController.getAddresses);

router.post('/addresses', authenticate, isCustomer, customerController.addAddress);

router.put('/addresses/:id', authenticate, isCustomer, customerController.updateAddress);

router.delete('/addresses/:id', authenticate, isCustomer, customerController.deleteAddress);

router.post('/orders', authenticate, isCustomer, customerController.placeOrder);

router.get('/cart', authenticate, isCustomer, customerController.getCart);

router.put('/cart', authenticate, isCustomer, customerController.updateCart);

router.delete('/cart', authenticate, isCustomer, customerController.clearCart);

router.get('/orders', authenticate, isCustomer, customerController.getOrders);

module.exports = router;

