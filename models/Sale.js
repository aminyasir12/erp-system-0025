const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../database/config/database');

class Sale extends Model {}

function initSale(sequelize) {
  Sale.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        }
      },
      saleDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('draft', 'completed', 'cancelled'),
        defaultValue: 'draft'
      },
      paymentStatus: {
        type: DataTypes.ENUM('pending', 'partial', 'paid'),
        defaultValue: 'pending'
      },
      paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
      },
      subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      taxAmount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0
      },
      paidAmount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      balance: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    },
    {
      sequelize,
      modelName: 'Sale',
      tableName: 'sales',
      timestamps: true,
      underscored: true
    }
  );
  return Sale;
}

module.exports = { Sale, initSale };
