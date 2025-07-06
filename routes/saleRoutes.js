const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const saleController = require('../controllers/saleController');

// حماية جميع الطرق بتسجيل الدخول
router.use(protect);

// إنشاء فاتورة بيع جديدة
router.post('/', saleController.createSale);

// الحصول على قائمة الفواتير
router.get('/', saleController.getSales);

// الحصول على تفاصيل فاتورة
router.get('/:id', saleController.getSale);

// تحديث حالة الدفع
router.patch('/:id/payment', saleController.updatePaymentStatus);

// إلغاء الفاتورة
router.delete('/:id', saleController.cancelSale);

module.exports = router;
