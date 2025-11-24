const { Product, Seller, User } = require('../models');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Seller,
          include: [
            {
              model: User,
              attributes: ['fullName'],
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      mrp: parseFloat(product.mrp),
      currentPrice: parseFloat(product.currentPrice),
      imagePath: product.imagePath || null,
      seller: {
        id: product.Seller.id,
        sellerName: product.Seller.User.fullName,
      },
    }));

    res.json(formattedProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Seller,
          include: [
            {
              model: User,
              attributes: ['fullName'],
            },
          ],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      id: product.id,
      name: product.name,
      mrp: parseFloat(product.mrp),
      currentPrice: parseFloat(product.currentPrice),
      imagePath: product.imagePath || null,
      seller: {
        id: product.Seller.id,
        sellerName: product.Seller.User.fullName,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};

