const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sellers',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mrp: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isLessThanOrEqualMRP(value) {
        if (parseFloat(value) > parseFloat(this.mrp)) {
          throw new Error('Current price must be less than or equal to MRP');
        }
      },
    },
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  paranoid: true,
});

module.exports = Product;



