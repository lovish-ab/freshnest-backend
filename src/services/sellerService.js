const { uploadFileToS3 } = require('../utils/s3');
const { Product, Seller } = require('../models');

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

module.exports = {
  getProducts,
  addProduct,
};

