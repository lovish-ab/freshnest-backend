export default (sequelize, DataTypes) => {
  const CartItem = sequelize.define(
    "CartItem",
    {
      cart_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      }
    },
    {
      tableName: "cart_items",
      timestamps: true
    }
  );

  return CartItem;
};
