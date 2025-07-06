const Joi = require('joi');
const { AppError } = require('./AppError');

// تعريف رسائل الخطأ المخصصة باللغة العربية
const customMessages = {
  'any.required': 'حقل {{#label}} مطلوب',
  'string.empty': 'حقل {{#label}} لا يمكن أن يكون فارغاً',
  'string.email': 'يجب إدخال بريد إلكتروني صالح',
  'string.min': 'يجب أن يحتوي {{#label}} على الأقل على {{#limit}} أحرف',
  'string.max': 'يجب ألا يزيد {{#label}} عن {{#limit}} أحرف',
  'number.min': 'يجب أن تكون قيمة {{#label}} على الأقل {{#limit}}',
  'number.max': 'يجب ألا تزيد قيمة {{#label}} عن {{#limit}}',
  'array.min': 'يجب أن يحتوي {{#label}} على الأقل على {{#limit}} عناصر',
  'array.max': 'يجب ألا يحتوي {{#label}} على أكثر من {{#limit}} عناصر',
  'date.base': '{{#label}} يجب أن يكون تاريخاً صالحاً',
  'date.min': '{{#label}} يجب أن يكون بعد أو يساوي {{:#limit}}',
  'date.max': '{{#label}} يجب أن يكون قبل أو يساوي {{:#limit}}',
  'any.only': '{{#label}} يجب أن يكون واحداً من {{#valids}}',
  'number.base': '{{#label}} يجب أن يكون رقماً',
  'string.pattern.base': '{{#label}} بتنسيق غير صالح',
};

// تعريف الأنماط المشتركة
const patterns = {
  phone: /^[0-9+\-\s()]{10,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  arabicText: /^[\u0600-\u06FF\s\d\-_]+$/,
  englishText: /^[A-Za-z\s\d\-_]+$/,
};

// تعريف المخططات المشتركة
const schemas = {
  // مصادقة المستخدم
  auth: {
    login: Joi.object({
      email: Joi.string().email().required().label('البريد الإلكتروني'),
      password: Joi.string().required().label('كلمة المرور'),
      rememberMe: Joi.boolean().default(false).label('تذكرني'),
    }),
    
    register: Joi.object({
      name: Joi.string().min(3).max(50).required().label('الاسم'),
      email: Joi.string().email().required().label('البريد الإلكتروني'),
      password: Joi.string()
        .min(8)
        .pattern(patterns.password)
        .required()
        .label('كلمة المرور')
        .messages({
          'string.pattern.base':
            'يجب أن تحتوي كلمة المرور على حرف كبير وحرف صغير ورقم على الأقل',
        }),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .label('تأكيد كلمة المرور')
        .messages({ 'any.only': 'كلمات المرور غير متطابقة' }),
      phone: Joi.string()
        .pattern(patterns.phone)
        .required()
        .label('رقم الهاتف'),
      role: Joi.string()
        .valid('user', 'admin', 'manager', 'employee')
        .default('user')
        .label('الدور'),
    }),
    
    forgotPassword: Joi.object({
      email: Joi.string().email().required().label('البريد الإلكتروني'),
    }),
    
    resetPassword: Joi.object({
      token: Joi.string().required().label('رمز إعادة التعيين'),
      password: Joi.string()
        .min(8)
        .pattern(patterns.password)
        .required()
        .label('كلمة المرور الجديدة'),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .label('تأكيد كلمة المرور')
        .messages({ 'any.only': 'كلمات المرور غير متطابقة' }),
    }),
  },
  
  // ملف المستخدم الشخصي
  profile: {
    update: Joi.object({
      name: Joi.string().min(3).max(50).label('الاسم'),
      email: Joi.string().email().label('البريد الإلكتروني'),
      phone: Joi.string().pattern(patterns.phone).label('رقم الهاتف'),
      address: Joi.string().max(255).label('العنوان'),
      avatar: Joi.string().label('الصورة الشخصية'),
    }).min(1),
  },
  
  // المنتجات
  product: {
    create: Joi.object({
      name: Joi.string().min(3).max(100).required().label('اسم المنتج'),
      description: Joi.string().allow('').label('الوصف'),
      price: Joi.number().min(0).required().label('السعر'),
      cost: Joi.number().min(0).label('التكلفة'),
      sku: Joi.string().required().label('الرمز الشريطي'),
      barcode: Joi.string().allow('').label('الباركود'),
      quantity: Joi.number().integer().min(0).default(0).label('الكمية'),
      categoryId: Joi.string().required().label('الفئة'),
      brand: Joi.string().allow('').label('العلامة التجارية'),
      weight: Joi.number().min(0).label('الوزن'),
      dimensions: Joi.object({
        length: Joi.number().min(0).label('الطول'),
        width: Joi.number().min(0).label('العرض'),
        height: Joi.number().min(0).label('الارتفاع'),
      }).label('الأبعاد'),
      isActive: Joi.boolean().default(true).label('نشط'),
    }),
    
    update: Joi.object({
      name: Joi.string().min(3).max(100).label('اسم المنتج'),
      description: Joi.string().allow('').label('الوصف'),
      price: Joi.number().min(0).label('السعر'),
      cost: Joi.number().min(0).label('التكلفة'),
      sku: Joi.string().label('الرمز الشريطي'),
      barcode: Joi.string().allow('').label('الباركود'),
      quantity: Joi.number().integer().min(0).label('الكمية'),
      categoryId: Joi.string().label('الفئة'),
      brand: Joi.string().allow('').label('العلامة التجارية'),
      weight: Joi.number().min(0).label('الوزن'),
      dimensions: Joi.object({
        length: Joi.number().min(0).label('الطول'),
        width: Joi.number().min(0).label('العرض'),
        height: Joi.number().min(0).label('الارتفاع'),
      }).label('الأبعاد'),
      isActive: Joi.boolean().label('نشط'),
    }).min(1),
  },
  
  // الفواتير
  invoice: {
    create: Joi.object({
      customerId: Joi.string().required().label('العميل'),
      items: Joi.array()
        .items(
          Joi.object({
            productId: Joi.string().required().label('المنتج'),
            quantity: Joi.number().integer().min(1).required().label('الكمية'),
            price: Joi.number().min(0).required().label('السعر'),
            discount: Joi.number().min(0).max(100).default(0).label('الخصم'),
          })
        )
        .min(1)
        .required()
        .label('المنتجات'),
      discount: Joi.number().min(0).default(0).label('الخصم الإجمالي'),
      tax: Joi.number().min(0).default(0).label('الضريبة'),
      shipping: Joi.number().min(0).default(0).label('مصاريف الشحن'),
      notes: Joi.string().allow('').label('ملاحظات'),
      status: Joi.string()
        .valid('pending', 'paid', 'cancelled', 'refunded')
        .default('pending')
        .label('حالة الفاتورة'),
      paymentMethod: Joi.string()
        .valid('cash', 'credit_card', 'bank_transfer', 'other')
        .default('cash')
        .label('طريقة الدفع'),
    }),
  },
  
  // البحث والترتيب
  query: {
    pagination: {
      page: Joi.number().integer().min(1).default(1).label('رقم الصفحة'),
      limit: Joi.number().integer().min(1).max(100).default(10).label('عدد العناصر'),
      sort: Joi.string().default('-createdAt').label('ترتيب النتائج'),
      search: Joi.string().allow('').label('بحث'),
    },
  },
};

/**
 * التحقق من صحة البيانات باستخدام Joi
 * @param {Object} data - البيانات المطلوب التحقق منها
 * @param {Object} schema - مخطط Joi للتحقق
 * @param {Object} options - خيارات إضافية للتحقق
 * @returns {Object} - كائن يحتوي على القيم المحولة وأي أخطاء
 */
const validate = (data, schema, options = {}) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
    messages: customMessages,
    ...options,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message,
      type: detail.type,
    }));

    throw new AppError('تحقق من صحة البيانات المدخلة', 400, {
      errors,
    });
  }

  return value;
};

/**
 * middleware للتحقق من صحة البيانات في طلبات API
 * @param {Object} schema - مخطط Joi للتحقق
 * @param {string} source - مصدر البيانات (body, query, params)
 * @returns {Function} - middleware function
 */
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const validatedData = validate(data, schema);
      
      // استبدال البيانات المدخلة بالبيانات المحققة
      req[source] = validatedData;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  schemas,
  validate,
  validateRequest,
  patterns,
};
