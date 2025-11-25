const { Product, Seller, User } = require('../models');

const getAllProducts = async () => {
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

  return formattedProducts;
};


module.exports = {
  getAllProducts,
};

