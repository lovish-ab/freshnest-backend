import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { body } from 'express-validator';

const router = express.Router();

router.post('/signup', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], signup);

router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], login);

export default router;
