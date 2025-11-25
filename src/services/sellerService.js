const { uploadFileToS3 } = require('../utils/s3');
const { Product, Seller, Order, OrderItem, User } = require('../models');

const getProducts = async (userId) => {
  const seller = await Seller.findOne({ where: { userId } });
  if (!seller) {
    throw new Error('Seller profile not found');
  }

  const products = await Product.findAll({
    where: { sellerId: seller.id },
    order: [['id', 'DESC']],
  });

  const formattedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    mrp: parseFloat(product.mrp),
    currentPrice: parseFloat(product.currentPrice),
    imagePath: product.imagePath || null,
  }));

  return formattedProducts;
};

const addProduct = async (userId, name, mrp, currentPrice, file) => {
  if (!name || !mrp || !currentPrice) {
    throw new Error('All fields are required');
  }

  if (parseFloat(currentPrice) > parseFloat(mrp)) {
    throw new Error('Current price must be less than or equal to MRP');
  }

  const seller = await Seller.findOne({ where: { userId } });
  if (!seller) {
    throw new Error('Seller profile not found');
  }

  let imagePath = null;
  if (file) {
    try {
      const s3Result = await uploadFileToS3(
        file.buffer,
        `product-images/${Date.now()}-${file.originalname}`,
        file.mimetype
      );
      imagePath = s3Result.Location;
    } catch (err) {
      throw new Error('Failed to upload image to S3');
    }
  }

  const product = await Product.create({
    sellerId: seller.id,
    name,
    mrp: parseFloat(mrp),
    currentPrice: parseFloat(currentPrice),
    imagePath,
  });

  return {
    id: product.id,
    name: product.name,
    mrp: parseFloat(product.mrp),
    currentPrice: parseFloat(product.currentPrice),
    imagePath: product.imagePath || null,
  };
};

const updateProduct = async (userId, productId, name, mrp, currentPrice, file) => {
  const seller = await Seller.findOne({ where: { userId } });
  if (!seller) {
    throw new Error('Seller profile not found');
  }

  const product = await Product.findOne({
    where: { id: productId, sellerId: seller.id },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (currentPrice && mrp && parseFloat(currentPrice) > parseFloat(mrp)) {
    throw new Error('Current price must be less than or equal to MRP');
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (mrp) updateData.mrp = parseFloat(mrp);
  if (currentPrice) updateData.currentPrice = parseFloat(currentPrice);
  
  if (file) {
    try {
      const s3Result = await uploadFileToS3(
        file.buffer,
        `product-images/${Date.now()}-${file.originalname}`,
        file.mimetype
      );
      updateData.imagePath = s3Result.Location;
    } catch (err) {
      throw new Error('Failed to upload image to S3');
    }
  }

  await product.update(updateData);

  return {
    id: product.id,
    name: product.name,
    mrp: parseFloat(product.mrp),
    currentPrice: parseFloat(product.currentPrice),
    imagePath: product.imagePath || null,
  };
};

const deleteProduct = async (userId, productId) => {
  const seller = await Seller.findOne({ where: { userId } });
  if (!seller) {
    throw new Error('Seller profile not found');
  }

  const product = await Product.findOne({
    where: { id: productId, sellerId: seller.id },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await product.destroy();

  return { message: 'Product deleted successfully' };
};

const getOrders = async (userId) => {
  const seller = await Seller.findOne({
    where: { userId },
    raw: true,
  });
  
  if (!seller) {
    throw new Error('Seller profile not found');
  }

  const orderItems = await OrderItem.findAll({
    where: { sellerId: seller.id },
    include: [
      {
        model: Order,
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'fullName', 'email'],
          },
        ],
      },
      {
        model: Product,
        attributes: ['id', 'name', 'imagePath'],
      },
    ],
    order: [[Order, 'orderDate', 'DESC']],
  });

  const ordersMap = new Map();

  orderItems.forEach((item) => {
    const orderId = item.Order.id;
    if (!ordersMap.has(orderId)) {
      ordersMap.set(orderId, {
        orderId: item.Order.id,
        customerName: item.Order.customer.fullName,
        customerEmail: item.Order.customer.email,
        shippingAddress: item.Order.shippingAddress,
        orderDate: item.Order.orderDate,
        totalPrice: parseFloat(item.Order.totalPrice),
        items: [],
      });
    }

    ordersMap.get(orderId).items.push({
      productId: item.Product.id,
      productName: item.Product.name,
      productImage: item.Product.imagePath || null,
      quantity: item.quantity,
      price: parseFloat(item.price),
    });
  });

  return Array.from(ordersMap.values());
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
};

