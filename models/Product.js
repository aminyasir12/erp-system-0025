const { DataTypes, Model } = require('sequelize');

class Product extends Model {}

const initProduct = (sequelize) => {
  Product.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  sellingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  reorderLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'piece'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'products',
    sequelize,
    modelName: 'Product'
  });

  return Product;
};

module.exports = { Product, initProduct };
