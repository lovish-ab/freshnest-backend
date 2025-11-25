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


module.exports = {
  getProducts,
  addProduct,
};

