const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const userController = require('../controllers/userController');

// حماية جميع الطرق بتسجيل الدخول
router.use(protect);

// الحصول على ملف المستخدم الشخصي
router.get('/me', userController.getMe);

// تحديث ملف المستخدم الشخصي
router.put('/me', userController.updateMe);

// تغيير كلمة المرور
router.patch('/change-password', userController.updateMyPassword);

// إدارة المستخدمين (للمشرفين فقط)
router.use(restrictTo('admin'));

// الحصول على قائمة المستخدمين
router.get('/', userController.getAllUsers);

// إنشاء مستخدم جديد
router.post('/', userController.createUser);

// الحصول على مستخدم محدد
router.route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
