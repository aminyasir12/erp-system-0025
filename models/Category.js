const { DataTypes, Model } = require('sequelize');

class Category extends Model {}

const initCategory = (sequelize) => {
  Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'categories',
    sequelize,
    modelName: 'Category'
  });

  return Category;
};

module.exports = { Category, initCategory };
