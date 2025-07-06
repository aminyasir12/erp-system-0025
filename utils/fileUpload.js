const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('./AppError');

// إنشاء مجلد التخزين إذا لم يكن موجوداً
const createUploadsFolder = (folder) => {
  const uploadPath = path.join(__dirname, `../public/uploads/${folder}`);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  return uploadPath;
};

// تهيئة التخزين
const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, createUploadsFolder(folder));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  });

// التحقق من نوع الملف
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(
    new AppError(
      'نوع الملف غير مدعوم. يرجى تحميل ملفات الصور أو المستندات فقط.',
      400
    ),
    false
  );
};

// إعداد رفع الملفات
const uploadFile = (folder, fieldName, maxCount = 1) => {
  const upload = multer({
    storage: storage(folder),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB كحد أقصى
    },
  });

  // معالجة الأخطاء
  return (req, res, next) => {
    const uploadHandler = upload.single(fieldName);
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // خطأ من Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت.', 400));
        }
        return next(new AppError('حدث خطأ أثناء تحميل الملف.', 400));
      } else if (err) {
        // خطأ آخر
        return next(err);
      }
      next();
    });
  };
};

// حذف الملف
const deleteFile = (filePath) => {
  const fullPath = path.join(__dirname, `../public${filePath}`);
  
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`فشل في حذف الملف: ${fullPath}`, err);
      }
    });
  }
};

// معالجة رفع ملفات متعددة
const uploadMultipleFiles = (folder, fieldName, maxCount = 5) => {
  const upload = multer({
    storage: storage(folder),
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB كحد أقصى
      files: maxCount,
    },
  });

  return (req, res, next) => {
    const uploadHandler = upload.array(fieldName, maxCount);
    uploadHandler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('حجم أحد الملفات كبير جداً. الحد الأقصى 5 ميجابايت.', 400));
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return next(new AppError(`لا يمكن تحميل أكثر من ${maxCount} ملفات في المرة الواحدة.`, 400));
        }
        return next(new AppError('حدث خطأ أثناء تحميل الملفات.', 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
};
