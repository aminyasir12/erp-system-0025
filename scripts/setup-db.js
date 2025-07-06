#!/usr/bin/env node

const { execSync } = require('child_process');
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env' });

async function setupDatabase() {
  console.log('🚀 بدء إعداد قاعدة البيانات...');
  
  // قراءة إعدادات الاتصال من المتغيرات البيئية
  const dbConfig = {
    database: process.env.DB_NAME || 'pos_system',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  };

  try {
    // 1. الاتصال بقاعدة البيانات الرئيسية (postgres)
    console.log('🔌 محاولة الاتصال بخادم PostgreSQL...');
    const sequelize = new Sequelize({
      ...dbConfig,
      database: 'postgres', // الاتصال بقاعدة البيانات الرئيسية
    });

    // 2. التحقق من وجود قاعدة البيانات
    console.log('🔍 التحقق من وجود قاعدة البيانات...');
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbConfig.database}'`
    );

    if (results.length === 0) {
      // 3. إنشاء قاعدة البيانات إذا لم تكن موجودة
      console.log(`🆕 جاري إنشاء قاعدة البيانات '${dbConfig.database}'...`);
      await sequelize.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log(`✅ تم إنشاء قاعدة البيانات '${dbConfig.database}' بنجاح`);
    } else {
      console.log(`ℹ️  قاعدة البيانات '${dbConfig.database}' موجودة بالفعل`);
    }

    // 4. إغلاق الاتصال
    await sequelize.close();
    
    console.log('✨ تم إعداد قاعدة البيانات بنجاح!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطأ في إعداد قاعدة البيانات:');
    console.error(error.message);
    
    // عرض تعليمات استكشاف الأخطاء وإصلاحها
    console.log('\n🔧 استكشاف الأخطاء وإصلاحها:');
    console.log('1. تأكد من تشغيل خادم PostgreSQL');
    console.log('2. تحقق من صحة بيانات الاعتماد في ملف .env');
    console.log('3. تأكد من أن المستخدم لديه صلاحيات إنشاء قواعد البيانات');
    console.log('4. تأكد من أن المنفذ 5432 مفتوح ويمكن الوصول إليه');
    
    process.exit(1);
  }
}

// تشغيل دالة الإعداد
setupDatabase();
