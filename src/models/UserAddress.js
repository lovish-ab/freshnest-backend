export default (sequelize, DataTypes) => {
  const UserAddress = sequelize.define('UserAddress', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    address_line1: { type: DataTypes.STRING, allowNull: false },
    address_line2: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    pincode: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    is_default: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'user_addresses',
    underscored: true,
    paranoid: true
  });

  return UserAddress;
};
