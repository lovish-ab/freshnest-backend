export default (sequelize, DataTypes) => {
  const Product = sequelize.define("Product", {
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    product_price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    offer_price: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
  }, {
    tableName: "products",
    timestamps: true
  });

  return Product;
};


