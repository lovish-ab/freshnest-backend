const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Seller, sequelize } = require('../models');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const customerSignup = async (fullName, email, phoneNumber, password) => {
  if (!fullName || !email || !phoneNumber || !password) {
    throw new Error('All fields are required');
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const user = await User.create({
    fullName,
    email,
    phoneNumber,
    password,
    role: 'Customer',
  });

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

const sellerSignup = async (fullName, email, password) => {
  if (!fullName || !email || !password) {
    throw new Error('All fields are required');
  }

  const transaction = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      throw new Error('Email already exists');
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

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const signin = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  customerSignup,
  sellerSignup,
  signin,
};

