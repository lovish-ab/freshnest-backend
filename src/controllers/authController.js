const authService = require('../services/authService');

const customerSignup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    const result = await authService.customerSignup(fullName, email, phoneNumber, password);

    res.status(201).json({
      message: 'Customer registered successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.message === 'All fields are required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Email already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const sellerSignup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const result = await authService.sellerSignup(fullName, email, password);

    res.status(201).json({
      message: 'Seller registered successfully',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.message === 'All fields are required' || error.message === 'Email already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.signin(email, password);

    res.json({
      message: 'Sign in successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error.message === 'Email and password are required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  customerSignup,
  sellerSignup,
  signin,
};

