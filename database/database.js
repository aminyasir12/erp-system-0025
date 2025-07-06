const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

// تحديد البيئة الحالية
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// إنشاء كائن Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: env === 'development' ? (msg) => logger.debug(msg) : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true
    },
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  }
);

// اختبار الاتصال بقاعدة البيانات
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('✅ تم الاتصال بنجاح بقاعدة البيانات');
    return true;
  } catch (error) {
    logger.error('❌ فشل الاتصال بقاعدة البيانات:', error);
    return false;
  }
}

// مزامنة النماذج مع قاعدة البيانات
async function syncModels(force = false) {
  try {
    if (force) {
      await sequelize.sync({ force: true });
      logger.warn('⚠️  تمت مزامنة النماذج مع حذف الجداول الموجودة');
    } else {
      await sequelize.sync({ alter: true });
      logger.info('🔄 تمت مزامنة النماذج مع قاعدة البيانات');
    }
    return true;
  } catch (error) {
    logger.error('❌ فشل في مزامنة النماذج:', error);
    return false;
  }
}

// تصدير الكائنات المطلوبة
module.exports = {
  sequelize,
  Sequelize,
  testConnection,
  syncModels
};

// إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  (async () => {
    console.log('🔍 اختبار اتصال قاعدة البيانات...');
    const connected = await testConnection();
    
    if (connected) {
      console.log('🔄 جاري مزامنة النماذج...');
      const synced = await syncModels(process.argv.includes('--force'));
      
      if (synced) {
        console.log('✅ تم إعداد قاعدة البيانات بنجاح!');
        process.exit(0);
      }
    }
    
    process.exit(1);
  })();
}
