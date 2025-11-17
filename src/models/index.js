import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import UserModel from "./User.js";
import UserAddressModel from "./UserAddress.js";
import ProductModel from "./Product.js";
import OrderModel from "./Order.js";
import CartModel from "./Cart.js";
import CartItemModel from "./CartItem.js";

const User = UserModel(sequelize, DataTypes);
const UserAddress = UserAddressModel(sequelize, DataTypes);
const Product = ProductModel(sequelize, DataTypes);
const Order = OrderModel(sequelize, DataTypes);
const Cart = CartModel(sequelize, DataTypes);
const CartItem = CartItemModel(sequelize, DataTypes);


User.hasMany(UserAddress, { foreignKey: "user_id", as: "addresses" });
UserAddress.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Product, { foreignKey: "seller_id", as: "products" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id" });

UserAddress.hasMany(Order, { foreignKey: "address_id", as: "orders" });
Order.belongsTo(UserAddress, { foreignKey: "address_id", as: "address" });

User.hasOne(Cart, { foreignKey: "user_id", as: "cart" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Cart.hasMany(CartItem, { foreignKey: "cart_id", as: "items" });
CartItem.belongsTo(Cart, { foreignKey: "cart_id" });

Product.hasMany(CartItem, { foreignKey: "product_id", as: "cartItems" });
CartItem.belongsTo(Product, { foreignKey: "product_id" });

export {
  sequelize,
  User,
  UserAddress,
  Product,
  Order,
  Cart,
  CartItem
};
