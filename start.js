#!/usr/bin/env node

// تحميل المتغيرات البيئية أولاً
require('dotenv').config({ path: '.env' });

// تسجيل المتغيرات البيئية المهمة (لأغراض التصحيح)
console.log('='.repeat(80));
console.log('🔍 تحميل المتغيرات البيئية:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('- DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('- DB_PORT:', process.env.DB_PORT || 5432);
console.log('- DB_NAME:', process.env.DB_NAME || 'erp_system');
console.log('- DB_USER:', process.env.DB_USER || 'postgres');
console.log('='.repeat(80));

// بدء التطبيق
require('./app');
