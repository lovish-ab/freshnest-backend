const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const isSeller = (req, res, next) => {
  if (req.user.role !== 'Seller') {
    return res.status(403).json({ error: 'Access denied. Seller privileges required.' });
  }
  next();
};

const isCustomer = (req, res, next) => {
  if (req.user.role !== 'Customer') {
    return res.status(403).json({ error: 'Access denied. Customer privileges required.' });
  }
  next();
};

module.exports = { authenticate, isSeller, isCustomer };



