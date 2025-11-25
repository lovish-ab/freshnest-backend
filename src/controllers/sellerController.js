const sellerService = require('../services/sellerService');

const getProducts = async (req, res) => {
  try {
    const products = await sellerService.getProducts(req.user.id);
    res.json(products);
  } catch (error) {
    if (error.message === 'Seller profile not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, mrp, currentPrice } = req.body;

    const product = await sellerService.addProduct(
      req.user.id,
      name,
      mrp,
      currentPrice,
      req.file
    );

    res.status(201).json({
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    if (error.message === 'All fields are required' || 
        error.message === 'Current price must be less than or equal to MRP') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Seller profile not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Failed to upload image to S3') {
      return res.status(500).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, mrp, currentPrice } = req.body;
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const product = await Product.findOne({
      where: { id: req.params.id, sellerId: seller.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (currentPrice && mrp && parseFloat(currentPrice) > parseFloat(mrp)) {
      return res
        .status(400)
        .json({ error: 'Current price must be less than or equal to MRP' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mrp) updateData.mrp = parseFloat(mrp);
    if (currentPrice) updateData.currentPrice = parseFloat(currentPrice);
    if (req.file) {
      try {
        const s3Result = await uploadFileToS3(
          req.file.buffer,
          `product-images/${Date.now()}-${req.file.originalname}`,
          req.file.mimetype
        );
        updateData.imagePath = s3Result.Location;
      } catch (err) {
        return res.status(500).json({ error: 'Failed to upload image to S3' });
      }
    }

    await product.update(updateData);

    res.json({
      message: 'Product updated successfully',
      product: {
        id: product.id,
        name: product.name,
        mrp: parseFloat(product.mrp),
        currentPrice: parseFloat(product.currentPrice),
        imagePath: product.imagePath || null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const product = await Product.findOne({
      where: { id: req.params.id, sellerId: seller.id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const seller = await Seller.findOne({
      where: { userId: req.user.id },
      raw: true,
    });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
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

    const orders = Array.from(ordersMap.values());

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
};