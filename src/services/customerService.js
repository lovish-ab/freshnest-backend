const { Order, OrderItem, Product, Seller, User, Cart, sequelize } = require('../models');

const placeOrder = async (customerId, items, shippingAddress) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Cart items are required');
  }

  if (!shippingAddress) {
    throw new Error('Shipping address is required');
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
        throw new Error(`Product ${item.productId} not found`);
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
        customerId,
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

    const cart = await Cart.findOne({ where: { userId: customerId }, transaction });
    if (cart) {
      await cart.update({ items: [] }, { transaction });
    }

    await transaction.commit();

    return {
      id: order.id,
      totalPrice: parseFloat(order.totalPrice),
      status: order.status,
      orderDate: order.orderDate,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getCart = async (userId) => {
  let cart = await Cart.findOne({ where: { userId } });
  
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return { items: cart.items || [] };
};

const updateCart = async (userId, items) => {
  let cart = await Cart.findOne({ where: { userId } });
  
  if (!cart) {
    cart = await Cart.create({ userId, items: items || [] });
  } else {
    await cart.update({ items: items || [] });
  }

  return { items: cart.items };
};

const clearCart = async (userId) => {
  const cart = await Cart.findOne({ where: { userId } });
  
  if (cart) {
    await cart.update({ items: [] });
  }

  return { message: 'Cart cleared successfully' };
};

const getOrders = async (customerId) => {
  const orders = await Order.findAll({
    where: { customerId },
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

  return formattedOrders;
};

module.exports = {
  placeOrder,
  getCart,
  updateCart,
  clearCart,
  getOrders,
};

