const { DataTypes, Model } = require('sequelize');

class PurchaseItem extends Model {}

const initPurchaseItem = (sequelize) => {
  PurchaseItem.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    purchaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'purchases',
        key: 'id'
      }
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
      defaultValue: 1
    },
    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    taxAmount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0
    },
    discountAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    totalPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'purchase_items',
    timestamps: true,
    underscored: true,
    sequelize,
    modelName: 'PurchaseItem'
  });

  return PurchaseItem;
};

module.exports = { PurchaseItem, initPurchaseItem };