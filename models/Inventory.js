const { DataTypes, Model } = require('sequelize');

class Inventory extends Model {}

const initInventory = (sequelize) => {
  Inventory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'inventory',
    sequelize,
    modelName: 'Inventory'
  });

  return Inventory;
};

module.exports = { Inventory, initInventory };
