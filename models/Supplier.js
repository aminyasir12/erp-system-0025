const { DataTypes, Model } = require('sequelize');

class Supplier extends Model {}

const initSupplier = (sequelize) => {
  Supplier.init({
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
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true
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
  paymentTerms: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true
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
    tableName: 'suppliers',
    sequelize,
    modelName: 'Supplier'
  });

  return Supplier;
};

module.exports = { Supplier, initSupplier };
