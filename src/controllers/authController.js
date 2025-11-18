import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../models/index.js';
dotenv.config();

const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email already exists' });
    const user = await User.create({ name, email, password, role: role || 'USER' });
    const token = signToken(user);
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const valid = await user.validatePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};
