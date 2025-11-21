const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads', 'product_images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/seller', require('./routes/seller'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/products', require('./routes/products'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;

