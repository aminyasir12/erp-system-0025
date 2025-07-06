const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {
  // دالة لمقارنة كلمات المرور
  async verifyPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

const initUser = (sequelize) => {
  User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    trim: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      if (value) {
        const hash = bcrypt.hashSync(value, 10);
        this.setDataValue('password', hash);
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    defaultValue: 'employee'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  defaultScope: {
    attributes: { exclude: ['password'] }
  },
  scopes: {
    withPassword: {
      attributes: {}
    }
  },
  sequelize,
  modelName: 'User'
});

  return User;
};

module.exports = { User, initUser };
