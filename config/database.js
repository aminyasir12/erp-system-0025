const { Sequelize } = require('sequelize');
const config = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// إنشاء نسخة من Sequelize مع إعدادات الاتصال
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port || 5432,
    dialect: 'postgres',
    logging: dbConfig.logging || false,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// اختبار الاتصال بقاعدة البيانات
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('تم الاتصال بقاعدة البيانات بنجاح.');
    return true;
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  Sequelize,
};
