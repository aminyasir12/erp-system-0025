const { Sale, SaleItem, Product, Customer } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { generateInvoiceNumber } = require('../utils/helpers');

// إنشاء فاتورة بيع جديدة
const createSale = catchAsync(async (req, res, next) => {
  const { customerId, items, paymentMethod, notes } = req.body;
  
  // حساب المجاميع
  let subtotal = 0;
  let taxAmount = 0;
  
  // التحقق من توفر المنتجات في المخزون
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (!product) {
      return next(new AppError(`المنتج غير موجود: ${item.productId}`, 404));
    }
    
    if (product.quantityInStock < item.quantity) {
      return next(new AppError(`الكمية المطلوبة غير متوفرة للمنتج: ${product.name}`, 400));
    }
    
    subtotal += item.unitPrice * item.quantity;
    taxAmount += (item.taxAmount || 0);
  }
  
  const total = subtotal + taxAmount;
  
  // إنشاء الفاتورة
  const sale = await Sale.create({
    invoiceNumber: generateInvoiceNumber(),
    customerId: customerId || null,
    paymentMethod: paymentMethod || 'نقدي',
    subtotal,
    taxAmount,
    total,
    status: 'completed',
    paymentStatus: paymentMethod === 'نقدي' ? 'paid' : 'pending',
    notes
  });
  
  // إضافة العناصر للفاتورة وتحديث المخزون
  for (const item of items) {
    await SaleItem.create({
      saleId: sale.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate || 0,
      taxAmount: item.taxAmount || 0,
      discount: item.discount || 0,
      total: (item.unitPrice * item.quantity) + (item.taxAmount || 0) - (item.discount || 0)
    });
    
    // تحديث كمية المنتج في المخزون
    await Product.decrement('quantityInStock', {
      by: item.quantity,
      where: { id: item.productId }
    });
  }
  
  res.status(201).json({
    status: 'success',
    data: {
      sale
    }
  });
});

// الحصول على تفاصيل فاتورة
const getSale = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const sale = await Sale.findOne({
    where: { id },
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone', 'email'] },
      { 
        model: SaleItem, 
        include: [{ model: Product, attributes: ['id', 'name', 'barcode', 'unit'] }] 
      }
    ]
  });
  
  if (!sale) {
    return next(new AppError('الفاتورة غير موجودة', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      sale
    }
  });
});

// الحصول على قائمة الفواتير
const getSales = catchAsync(async (req, res, next) => {
  const { startDate, endDate, status, customerId, page = 1, limit = 10 } = req.query;
  
  const where = {};
  
  if (startDate && endDate) {
    where.saleDate = {
      [Op.between]: [new Date(startDate), new Date(endDate)]
    };
  }
  
  if (status) {
    where.status = status;
  }
  
  if (customerId) {
    where.customerId = customerId;
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows: sales } = await Sale.findAndCountAll({
    where,
    include: [
      { model: Customer, attributes: ['id', 'name'] }
    ],
    order: [['saleDate', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  res.status(200).json({
    status: 'success',
    results: sales.length,
    total: count,
    data: {
      sales
    }
  });
});

// تحديث حالة الدفع
const updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { paymentStatus, paymentMethod } = req.body;
  
  const sale = await Sale.findByPk(id);
  
  if (!sale) {
    return next(new AppError('الفاتورة غير موجودة', 404));
  }
  
  sale.paymentStatus = paymentStatus || sale.paymentStatus;
  sale.paymentMethod = paymentMethod || sale.paymentMethod;
  
  if (paymentStatus === 'paid') {
    sale.paymentDate = new Date();
  }
  
  await sale.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      sale
    }
  });
});

// إلغاء الفاتورة
const cancelSale = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const sale = await Sale.findByPk(id, {
    include: [SaleItem]
  });
  
  if (!sale) {
    return next(new AppError('الفاتورة غير موجودة', 404));
  }
  
  if (sale.status === 'cancelled') {
    return next(new AppError('الفاتورة ملغاة بالفعل', 400));
  }
  
  // إرجاع الكميات للمخزون
  for (const item of sale.SaleItems) {
    await Product.increment('quantityInStock', {
      by: item.quantity,
      where: { id: item.productId }
    });
  }
  
  sale.status = 'cancelled';
  await sale.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      sale
    }
  });
});

module.exports = {
  createSale,
  getSale,
  getSales,
  updatePaymentStatus,
  cancelSale
};
