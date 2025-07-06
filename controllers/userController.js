const { User } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

// إنشاء توكن JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// دالة للحصول على بيانات المستخدم الحالي
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// دالة لتحديث كلمة المرور
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) الحصول على المستخدم من مجموعة البيانات
  const user = await User.findByPk(req.user.id);

  // 2) التحقق من صحة كلمة المرور الحالية
  if (!(await user.verifyPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('كلمة المرور الحالية غير صحيحة', 401));
  }

  // 3) تحديث كلمة المرور
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) تسجيل الدخول، إرسال JWT
  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
    message: 'تم تحديث كلمة المرور بنجاح'
  });
});

// الحصول على جميع المستخدمين
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.findAll({
    attributes: { exclude: ['password', 'passwordChangedAt'] },
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// الحصول على مستخدم بواسطة المعرف
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ['password', 'passwordChangedAt'] },
  });

  if (!user) {
    return next(new AppError('لا يوجد مستخدم بهذا المعرف', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// إنشاء مستخدم جديد (للمشرفين فقط)
exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  // إخفاء كلمة المرور من الناتج
  newUser.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// تحديث بيانات المستخدم
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) إنشاء خطأ إذا قام المستخدم بمحاولة تحديث كلمة المرور
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'هذا المسار غير مخصص لتحديث كلمة المرور. الرجاء استخدام /updateMyPassword',
        400
      )
    );
  }

  // 2) تصفية الحقول المسموح بتحديثها
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'address'
  );

  // 3) تحديث بيانات المستخدم
  const updatedUser = await User.update(filteredBody, {
    where: { id: req.user.id },
    returning: true,
    individualHooks: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser[1][0],
    },
  });
});

// حذف المستخدم (تعطيل الحساب)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.update(
    { active: false },
    {
      where: { id: req.user.id },
    }
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// تحديث بيانات المستخدم (للمشرفين فقط)
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new AppError('لا يوجد مستخدم بهذا المعرف', 404));
  }

  // تحديث البيانات
  const updatedUser = await user.update(req.body, {
    fields: ['name', 'email', 'role', 'isActive'],
    returning: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// حذف المستخدم (للمشرفين فقط)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new AppError('لا يوجد مستخدم بهذا المعرف', 404));
  }

  await user.destroy();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
