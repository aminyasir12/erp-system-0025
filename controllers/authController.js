const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');

// إنشاء توكن JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// إنشاء وإرسال توكن
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // إخفاء كلمة المرور من الناتج
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// تسجيل الدخول
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) التحقق من وجود البريد الإلكتروني وكلمة المرور
    if (!email || !password) {
      return next(new AppError('الرجاء إدخال البريد الإلكتروني وكلمة المرور', 400));
    }

    // 2) التحقق من وجود المستخدم وكلمة المرور
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.verifyPassword(password, user.password))) {
      return next(new AppError('البريد الإلكتروني أو كلمة المرور غير صحيحة', 401));
    }

    // 3) إذا كان كل شيء صحيحاً، قم بإرسال التوكن للعميل
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// حماية المسارات - التأكد من تسجيل الدخول
exports.protect = async (req, res, next) => {
  try {
    // 1) الحصول على التوكن والتحقق من وجوده
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
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
    next();
  } catch (err) {
    next(err);
  }
};

// تقييد الصلاحيات حسب الدور
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'manager']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('ليس لديك صلاحية للقيام بهذه العملية', 403)
      );
    }

    next();
  };
};
