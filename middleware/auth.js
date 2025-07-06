const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

// Middleware لحماية المسارات
const protect = async (req, res, next) => {
  try {
    // 1) الحصول على التوكن من الرأس
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(
        new AppError('لم تقم بتسجيل الدخول! الرجاء تسجيل الدخول للوصول.', 401)
      );
    }

    // 2) التحقق من صحة التوكن
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // 3) التحقق من وجود المستخدم
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('لم يعد المستخدم المالك لهذا الرمز موجوداً.', 401)
      );
    }

    // 4) التحقق مما إذا قام المستخدم بتغيير كلمة المرور بعد إصدار التوكن
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('قام المستخدم بتغيير كلمة المرور مؤخراً! الرجاء تسجيل الدخول مرة أخرى.', 401)
      );
    }

    // منح صلاحية الوصول إلى المسار المحمي
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (err) {
    next(err);
  }
};

// تقييد الصلاحيات حسب الدور
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('ليس لديك صلاحية للقيام بهذه العملية', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
