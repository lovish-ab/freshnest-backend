const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Seller, sequelize } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const customerSignup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      role: 'Customer',
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Customer registered successfully',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sellerSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const transaction = await sequelize.transaction();

    try {
      const existingUser = await User.findOne({ where: { email }, transaction });
      if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Email already exists' });
      }

      const user = await User.create({
        fullName,
        email,
        phoneNumber: '',
        password,
        role: 'Seller',
      }, { transaction });

      await Seller.create({
        userId: user.id,
      }, { transaction });

      await transaction.commit();

      const token = generateToken(user.id);

      res.status(201).json({
        message: 'Seller registered successfully',
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  customerSignup,
  sellerSignup,
  signin,
};

