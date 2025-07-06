const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Sequelize } = require('sequelize');
const path = require('path');
const { logger, errorHandler } = require('./middleware/index');
const passportConfig = require('./config/passport');
const { syncModels } = require('./models');
const routes = require('./routes'); // ملف routes/index.js يجمع كل الراوترات

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعدادات الملفات الثابتة
app.use(express.static(path.join(__dirname, 'public')));

// إعدادات الجلسة
const sessionConfig = require('./config/sessionConfig'); // ملف خارجي للجلسة
app.use(session(sessionConfig));

// تهيئة المصادقة
app.use(passport.initialize());
app.use(passport.session());
// تهيئة passport
if (typeof passportConfig.initializePassport === 'function') {
  passportConfig.initializePassport(passport);
}

// جميع المسارات
app.use('/api/v1', routes);

// الصفحة الرئيسية
app.get('/', require('./controllers/homeController'));

// معالجة 404
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'الصفحة المطلوبة غير موجودة',
    code: 404
  });
});

// معالج الأخطاء العام
app.use(errorHandler);

// تصدير التطبيق
module.exports = app;