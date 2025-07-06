const { Model, DataTypes } = require('sequelize');

class SaleItem extends Model {}

function initSaleItem(sequelize) {
  SaleItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      saleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
        allowNull: false
      },
      taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0
      },
      taxAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      discount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'SaleItem',
      tableName: 'sale_items',
      timestamps: true,
      underscored: true
    }
  );
  return SaleItem;
}

module.exports = { SaleItem, initSaleItem };
