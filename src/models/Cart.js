export default (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: "carts",
      timestamps: true
    }
  );

  return Cart;
};
