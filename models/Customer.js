const { DataTypes, Model } = require('sequelize');

class Customer extends Model {}

const initCustomer = (sequelize) => {
  Customer.init({
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
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  taxNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  creditLimit: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  currentBalance: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
    timestamps: true,
    underscored: true,
    tableName: 'customers',
    sequelize,
    modelName: 'Customer'
  });

  return Customer;
};

module.exports = { Customer, initCustomer };
