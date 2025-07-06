const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

// مسارات المصادقة
router.post('/login', authController.login);

// حماية جميع المسارات التالية
router.use(authController.protect);

// تحديث كلمة المرور
router.patch('/updateMyPassword', userController.updateMyPassword);

// الحصول على بياناتي
router.get('/me', userController.getMe, userController.getUser);
// تحديث بياناتي
router.patch('/updateMe', userController.updateMe);
// تعطيل حسابي
router.delete('/deleteMe', userController.deleteMe);

// تقييد الصلاحيات للمشرفين فقط
router.use(authController.restrictTo('admin'));

// مسارات إدارة المستخدمين (للمشرفين فقط)
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
