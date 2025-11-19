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
      timestamps: true,
      underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
    paranoid: true
    }
  );

  return Cart;
};
