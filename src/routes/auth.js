const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.customerSignup);

router.post('/seller/signup', authController.sellerSignup);

router.post('/signin', authController.signin);

module.exports = router;



