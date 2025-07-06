const i18n = require('i18n');
const path = require('path');
const fs = require('fs');

// تهيئة مجلدات الترجمات
const localesDir = path.join(__dirname, '../locales');
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

// تهيئة i18n
i18n.configure({
  locales: ['ar', 'en'], // اللغات المدعومة
  defaultLocale: 'ar', // اللغة الافتراضية
  directory: localesDir, // مجلد ملفات الترجمات
  objectNotation: true, // تمكين الترميز الكائني للوصول للترجمات
  updateFiles: false, // منع التحديث التلقائي لملفات اللغة
  autoReload: process.env.NODE_ENV !== 'production', // إعادة تحميل التلقائي في وضع التطوير
  syncFiles: false, // مزامنة المفاتيح بين ملفات اللغة
  queryParameter: 'lang', // معلمة URL لتغيير اللغة
  cookie: 'locale', // اسم ملف تعريف الارتباط لحفظ إعدادات اللغة
  api: {
    __: 't', // اسم الدالة للترجمة
    __n: 'tn', // اسم الدالة للجمع
    __l: 'tl', // اسم الدالة لقائمة اللغات
    __h: 'th', // اسم الدالة للمساعدة
  },
});

// إنشاء ملفات اللغة إذا لم تكن موجودة
const createLocaleFiles = () => {
  const defaultTranslations = {
    ar: {
      app: {
        name: 'نظام إدارة الأعمال',
        description: 'نظام متكامل لإدارة الأعمال',
      },
      auth: {
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        forgotPassword: 'نسيت كلمة المرور؟',
        resetPassword: 'إعادة تعيين كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        rememberMe: 'تذكرني',
      },
      common: {
        save: 'حفظ',
        cancel: 'إلغاء',
        edit: 'تعديل',
        delete: 'حذف',
        search: 'بحث',
        actions: 'الإجراءات',
        create: 'إنشاء',
        update: 'تحديث',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'تمت العملية بنجاح',
        warning: 'تحذير',
        info: 'معلومة',
        confirm: 'تأكيد',
        required: 'مطلوب',
        optional: 'اختياري',
      },
      validation: {
        required: 'هذا الحقل مطلوب',
        email: 'البريد الإلكتروني غير صالح',
        min: 'يجب أن يكون طول النص على الأقل {{count}} حرف',
        max: 'يجب ألا يزيد طول النص عن {{count}} حرف',
        match: 'القيم غير متطابقة',
      },
      errors: {
        404: 'الصفحة غير موجودة',
        500: 'خطأ في الخادم الداخلي',
        network: 'خطأ في الاتصال بالخادم',
        unknown: 'حدث خطأ غير معروف',
      },
    },
    en: {
      app: {
        name: 'Business Management System',
        description: 'Integrated Business Management System',
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        resetPassword: 'Reset Password',
        confirmPassword: 'Confirm Password',
        rememberMe: 'Remember Me',
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        search: 'Search',
        actions: 'Actions',
        create: 'Create',
        update: 'Update',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        confirm: 'Confirm',
        required: 'Required',
        optional: 'Optional',
      },
      validation: {
        required: 'This field is required',
        email: 'Invalid email address',
        min: 'Must be at least {{count}} characters',
        max: 'Must be at most {{count}} characters',
        match: 'Values do not match',
      },
      errors: {
        404: 'Page not found',
        500: 'Internal Server Error',
        network: 'Network Error',
        unknown: 'An unknown error occurred',
      },
    },
  };

  // إنشاء ملفات اللغة
  Object.entries(defaultTranslations).forEach(([locale, translations]) => {
    const filePath = path.join(localesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8');
    }
  });
};

// استدعاء الدالة لإنشاء ملفات اللغة
createLocaleFiles();

// middleware لتعيين اللغة بناءً على طلب المستخدم
const setLocale = (req, res, next) => {
  // تحديد اللغة من معلمات الطلب أو ملفات تعريف الارتباط أو رأس القبول
  let locale = req.query.lang || req.cookies?.locale || req.acceptsLanguages(i18n.getLocales()) || 'ar';
  
  // تعيين لغة i18n
  i18n.setLocale(locale);
  
  // تعيين اللغة في كائن الطلب للوصول إليها في المتغيرات المحلية
  req.locale = locale;
  
  // تعيين اللغة في المتغيرات المحلية للقوالب
  res.locals.locale = locale;
  res.locals.t = i18n.__;
  res.locals.tn = i18n.__n;
  
  // تعيين ملف تعريف الارتباط للغة إذا كانت مختلفة
  if (req.cookies?.locale !== locale) {
    res.cookie('locale', locale, { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
      httpOnly: true,
    });
  }
  
  next();
};

// دالة مساعدة للحصول على نص مترجم
const translate = (key, options = {}) => {
  return i18n.__(key, options);
};

// دالة مساعدة للحصول على نص مترجم بصيغة الجمع
const translatePlural = (key, count, options = {}) => {
  return i18n.__n(key, count, options);
};

module.exports = {
  i18n,
  setLocale,
  translate,
  translatePlural,
};
