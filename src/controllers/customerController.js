const customerService = require('../services/customerService');

const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    const order = await customerService.placeOrder(req.user.id, items, shippingAddress);

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    if (error.message === 'Cart items are required' || error.message === 'Shipping address is required') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Product') && error.message.includes('not found')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const result = await customerService.getCart(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { items } = req.body;

    const result = await customerService.updateCart(req.user.id, items);

    res.json({ message: 'Cart updated successfully', items: result.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const result = await customerService.clearCart(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await customerService.getOrders(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  placeOrder,
  getCart,
  updateCart,
  clearCart,
  getOrders,
};

