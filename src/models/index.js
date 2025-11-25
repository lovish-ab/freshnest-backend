const sequelize = require('../config/database');
const User = require('./User');
const Seller = require('./Seller');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');


User.hasOne(Seller, { foreignKey: 'userId', onDelete: 'CASCADE' });
Seller.belongsTo(User, { foreignKey: 'userId' });

Seller.hasMany(Product, { foreignKey: 'sellerId', onDelete: 'CASCADE' });
Product.belongsTo(Seller, { foreignKey: 'sellerId' });

User.hasMany(Order, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });


Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasOne(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Seller,
  Product,
  Order,
  OrderItem,
  Cart,
};



