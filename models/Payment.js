const { DataTypes, Model } = require('sequelize');

class Payment extends Model {
  // يمكن إضافة دوال الموديل هنا
}

const initPayment = (sequelize) => {
  Payment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('receipt', 'payment'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'completed'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  referenceType: {
    type: DataTypes.ENUM('sale', 'purchase', 'expense', 'other'),
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
}, {
  timestamps: true,
  underscored: true,
    tableName: 'payments',
    sequelize,
    modelName: 'Payment'
  });

  return Payment;
};

module.exports = { Payment, initPayment };
