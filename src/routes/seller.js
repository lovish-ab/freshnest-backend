const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});
const { authenticate, isSeller } = require('../middleware/auth');
const sellerController = require('../controllers/sellerController');


router.get('/products', authenticate, isSeller, sellerController.getProducts);

router.post(
  '/products',
  authenticate,
  isSeller,
  upload.single('image'),
  sellerController.addProduct
);

router.put(
  '/products/:id',
  authenticate,
  isSeller,
  upload.single('image'),
  sellerController.updateProduct
);

router.delete('/products/:id', authenticate, isSeller, sellerController.deleteProduct);

router.get('/orders', authenticate, isSeller, sellerController.getOrders);

module.exports = router;
