const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// دالة للتحقق من وجود ملف
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// تسجيل المسارات المتاحة فقط
const routeFiles = {
  '/auth': './authRoutes.js',
  '/users': './userRoutes.js',
  '/sales': './saleRoutes.js'
};

// إضافة المسارات المتاحة فقط
Object.entries(routeFiles).forEach(([route, file]) => {
  const filePath = path.join(__dirname, file);
  if (fileExists(filePath)) {
    router.use(route, require(file));
  }
});

// مسار افتراضي للتحقق من عمل API
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API يعمل بشكل صحيح',
    timestamp: new Date()
  });
});

module.exports = router;