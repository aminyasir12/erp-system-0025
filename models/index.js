const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');

// تحديد البيئة (تطوير، اختبار، إنتاج)
// تحديد بيئة التشغيل
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

if (!dbConfig) {
  console.error('❌ لم يتم العثور على إعدادات قاعدة البيانات للبيئة:', env);
  process.exit(1);
}

console.log('🔍 إعدادات اتصال قاعدة البيانات:');
console.log('- البيئة:', env);
console.log('- المضيف:', dbConfig.host);
console.log('- المنفذ:', dbConfig.port);
console.log('- اسم قاعدة البيانات:', dbConfig.database);
console.log('- اسم المستخدم:', dbConfig.username);
console.log('- نوع قاعدة البيانات:', dbConfig.dialect);

// التحقق من وجود جميع الإعدادات المطلوبة
const requiredConfig = ['host', 'port', 'database', 'username', 'password', 'dialect'];
const missingConfig = requiredConfig.filter(key => !dbConfig[key]);

if (missingConfig.length > 0) {
  console.error(`❌ إعدادات قاعدة البيانات ناقصة: ${missingConfig.join(', ')}`);
  process.exit(1);
}

// إنشاء اتصال قاعدة البيانات مع معالجة الأخطاء
let sequelize;
try {
  console.log('🔌 جاري إنشاء اتصال بقاعدة البيانات...');
  
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port || 5432,
      dialect: dbConfig.dialect || 'postgres',
      logging: (msg) => console.log(`[Sequelize] ${msg}`), // تفعيل التسجيل
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
        idle: 10000
      },
      retry: {
        max: 3, // عدد المحاولات عند فشل الاتصال
        timeout: 30000 // مهلة كل محاولة بالمللي ثانية
      }
    }
  );
  
  console.log('✅ تم إنشاء اتصال Sequelize بنجاح');
} catch (error) {
  console.error('❌ فشل في إنشاء اتصال Sequelize:', error.message);
  console.error('تفاصيل الخطأ:', error);
  process.exit(1);
}

const db = {
  sequelize,
  Sequelize,
  models: {}
};

// Import model initializers
const { User, initUser } = require('./User');
const { Category, initCategory } = require('./Category');
const { Product, initProduct } = require('./Product');
const { Inventory, initInventory } = require('./Inventory');
const { Customer, initCustomer } = require('./Customer');
const { Supplier, initSupplier } = require('./Supplier');
const { Purchase, initPurchase } = require('./Purchase');
const { Sale, initSale } = require('./Sale');
const { SaleItem, initSaleItem } = require('./SaleItem');
const { Payment, initPayment } = require('./Payment');

// تهيئة جميع النماذج مع معالجة الأخطاء
const initializeModels = () => {
  try {
    console.log('جاري تهيئة النماذج...');
    
    // قائمة بجميع دوال التهيئة
    const initializers = [
      { name: 'User', init: initUser },
      { name: 'Category', init: initCategory },
      { name: 'Product', init: initProduct },
      { name: 'Inventory', init: initInventory },
      { name: 'Customer', init: initCustomer },
      { name: 'Supplier', init: initSupplier },
      { name: 'Purchase', init: initPurchase },
      { name: 'Sale', init: initSale },
      { name: 'SaleItem', init: initSaleItem },
      { name: 'Payment', init: initPayment }
    ];

    // تنفيذ كل دالة تهيئة
    initializers.forEach(({ name, init }) => {
      try {
        init(sequelize);
        console.log(`✅ تم تهيئة نموذج ${name} بنجاح`);
      } catch (error) {
        console.error(`❌ فشل في تهيئة نموذج ${name}:`, error.message);
        throw error; // إعادة رمي الخطأ لإيقاف التهيئة
      }
    });
    
    console.log('تم تهيئة جميع النماذج بنجاح');
  } catch (error) {
    console.error('حدث خطأ أثناء تهيئة النماذج:', error);
    throw error;
  }
};

// استدعاء دالة التهيئة
initializeModels();

// Set up model relationships (associations)
Object.keys(sequelize.models).forEach(modelName => {
  if (sequelize.models[modelName].associate) {
    sequelize.models[modelName].associate(sequelize.models);
  }
  db[modelName] = sequelize.models[modelName];
  db.models[modelName] = sequelize.models[modelName];
});

// مزامنة النماذج مع قاعدة البيانات
const syncModels = async (options = {}) => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('جاري الاتصال بقاعدة البيانات...');
    await sequelize.authenticate({ transaction });
    console.log('تم الاتصال بقاعدة البيانات بنجاح');
    
    console.log('جاري مزامنة النماذج...');
    await sequelize.sync({
      force: false,       // لا تقم بإسقاط الجداول الموجودة
      alter: true,        // قم بتحديث الجداول لتطابق النماذج
      logging: console.log, // تفعيل التسجيل
      transaction
    });
    
    await transaction.commit();
    console.log('✅ تمت مزامنة النماذج بنجاح');
    return true;
  } catch (error) {
    await transaction.rollback();
    console.error('❌ فشل في مزامنة النماذج:', error.message);
    console.error('تفاصيل الخطأ:', error);
    throw error; // إعادة رمي الخطأ للتعامل معه في المستوى الأعلى
  }
};

// Export the database connection and models
module.exports = {
  ...db,
  syncModels,
  sequelize,
  Sequelize
};
