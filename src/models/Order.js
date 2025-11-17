export default (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    address_id: { type: DataTypes.INTEGER, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    order_items: { type: DataTypes.JSONB, allowNull: false },
    status: { type: DataTypes.ENUM('pending','confirmed','shipped','delivered','cancelled'), defaultValue: 'pending' }
  }, {
    tableName: 'orders',
    underscored: true,
    paranoid: true
  });

  return Order;
};
