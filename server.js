require('dotenv').config();
const http = require('http');
const app = require('./app');

// الحصول على المنفذ من متغيرات البيئة أو استخدام المنفذ الافتراضي
const PORT = process.env.PORT || 3000;

// إنشاء خادم HTTP
const server = http.createServer(app);

// بدء الخادم
server.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT} - ${process.env.NODE_ENV}`);
  console.log(`الرابط: http://localhost:${PORT}`);
});

// معالجة أخطاء غير متوقعة
process.on('unhandledRejection', (err) => {
  console.error('حدث خطأ غير متوقع:', err);
  // إغلاق الخادم ثم الخروج من العملية
  server.close(() => {
    process.exit(1);
  });
});

// معالجة إشارات الإغلاق
process.on('SIGTERM', () => {
  console.log('SIGTERM تم استلامه. إغلاق الخادم...');
  server.close(() => {
    console.log('تم إغلاق الخادم');
  });
});
