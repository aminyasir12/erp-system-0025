const { Sequelize } = require('sequelize');
require('dotenv').config();

// إنشاء اتصال بقاعدة البيانات
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      useUTC: false, // للتعامل مع التوقيت المحلي
    },
    timezone: '+03:00', // توقيت الرياض
  }
);

// اختبار الاتصال
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
  } catch (error) {
    console.error('فشل الاتصال بقاعدة البيانات:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
