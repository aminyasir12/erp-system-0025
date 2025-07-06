require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// إعدادات الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// توجيه جميع المسارات غير المعروفة إلى الصفحة الرئيسية (للتطبيقات أحادية الصفحة)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// بدء الخادم
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
  console.log(`الرابط: http://localhost:${PORT}`);
});