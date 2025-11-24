const path = require('path');
const { uploadFileToS3 } = require('../utils/s3');
const { Product, Seller, Order, OrderItem, User } = require('../models');

const getProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
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

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, mrp, currentPrice } = req.body;

    if (!name || !mrp || !currentPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (parseFloat(currentPrice) > parseFloat(mrp)) {
      return res
        .status(400)
        .json({ error: 'Current price must be less than or equal to MRP' });
    }

    const seller = await Seller.findOne({ where: { userId: req.user.id } });
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    let imagePath = null;
    if (req.file) {
      try {
        const s3Result = await uploadFileToS3(
          req.file.buffer,
          `product-images/${Date.now()}-${req.file.originalname}`,
          req.file.mimetype
        );
        imagePath = s3Result.Location;
      } catch (err) {
        return res.status(500).json({ error: 'Failed to upload image to S3' });
      }
    }

    const product = await Product.create({
      sellerId: seller.id,
      name,
      mrp: parseFloat(mrp),
      currentPrice: parseFloat(currentPrice),
      imagePath,
    });

    res.status(201).json({
      message: 'Product added successfully',
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


module.exports = {
  getProducts,
  addProduct,
};

