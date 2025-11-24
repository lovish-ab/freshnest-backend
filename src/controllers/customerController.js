const { Op } = require('sequelize');
const { Order, OrderItem, Product, Seller, User, Address, Cart, sequelize } = require('../models');


const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    const transaction = await sequelize.transaction();

    try {
      let totalPrice = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await Product.findByPk(item.productId, {
          include: [{ model: Seller }],
          transaction,
        });

        if (!product) {
          await transaction.rollback();
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }

        const itemPrice = parseFloat(product.currentPrice) * item.quantity;
        totalPrice += itemPrice;

        orderItemsData.push({
          productId: product.id,
          sellerId: product.sellerId,
          quantity: item.quantity,
          price: product.currentPrice,
        });
      }

      const order = await Order.create(
        {
          customerId: req.user.id,
          shippingAddress,
          totalPrice,
        },
        { transaction }
      );

      for (const itemData of orderItemsData) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: itemData.productId,
            sellerId: itemData.sellerId,
            quantity: itemData.quantity,
            price: itemData.price,
          },
          { transaction }
        );
      }

      const cart = await Cart.findOne({ where: { userId: req.user.id }, transaction });
      if (cart) {
        await cart.update({ items: [] }, { transaction });
      }

      await transaction.commit();

      res.status(201).json({
        message: 'Order placed successfully',
        order: {
          id: order.id,
          totalPrice: parseFloat(order.totalPrice),
          status: order.status,
          orderDate: order.orderDate,
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

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    res.json({ items: cart.items || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { items } = req.body;

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: items || [] });
    } else {
      await cart.update({ items: items || [] });
    }

    res.json({ message: 'Cart updated successfully', items: cart.items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (cart) {
      await cart.update({ items: [] });
    }

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { customerId: req.user.id },
      include: [
        {
          model: OrderItem,
          required: false,
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'imagePath'],
              required: false,
            },
            {
              model: Seller,
              attributes: ['id'],
              required: false,
              include: [
                {
                  model: User,
                  attributes: ['fullName'],
                  required: false,
                },
              ],
            },
          ],
        },
      ],
      order: [['orderDate', 'DESC']],
    });

    const formattedOrders = orders.map((order) => {
      const items = (order.OrderItems || []).map((item) => ({
        productId: item.Product?.id || item.productId,
        productName: item.Product?.name || 'Unknown Product',
        productImage: item.Product?.imagePath || null,
        quantity: item.quantity,
        price: parseFloat(item.price),
      }));

      return {
        id: order.id,
        shippingAddress: order.shippingAddress,
        totalPrice: parseFloat(order.totalPrice),
        orderDate: order.orderDate,
        items: items,
      };
    });

    res.json(formattedOrders);
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

