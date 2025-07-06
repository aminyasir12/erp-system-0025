const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('./AppError');

// تهيئة التخزين السحابي
let storage;
let bucketName;

// تهيئة التخزين السحابي
const initCloudStorage = () => {
  try {
    // استخدام بيانات الاعتماد من متغيرات البيئة أو ملف المفتاح
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
      ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
      : undefined;

    storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials,
    });

    bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
    
    if (!bucketName) {
      throw new Error('لم يتم تحديد اسم الـ bucket في متغيرات البيئة');
    }

    return { storage, bucketName };
  } catch (error) {
    console.error('فشل في تهيئة التخزين السحابي:', error);
    throw new AppError('فشل في تهيئة خدمة التخزين السحابي', 500);
  }
};

// تحميل ملف إلى التخزين السحابي
const uploadFile = async (file, destinationPath = '', options = {}) => {
  try {
    if (!storage) initCloudStorage();

    const { originalname, path: tempFilePath } = file;
    const fileExtension = path.extname(originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = destinationPath ? `${destinationPath}/${fileName}` : fileName;

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filePath);

    // خيارات التحميل
    const uploadOptions = {
      destination: blob,
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: originalname,
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        },
      },
      ...options,
    };

    // رفع الملف
    await bucket.upload(tempFilePath, uploadOptions);

    // جعل الملف عاماً للوصول العام
    if (options.public) {
      await blob.makePublic();
    }

    // حذف الملف المؤقت
    fs.unlinkSync(tempFilePath);

    // إرجاع معلومات الملف
    const [metadata] = await blob.getMetadata();
    const publicUrl = options.public ? blob.publicUrl() : null;

    return {
      fileName,
      filePath,
      publicUrl,
      contentType: metadata.contentType,
      size: metadata.size,
      metadata: metadata.metadata,
      bucket: bucketName,
    };
  } catch (error) {
    console.error('فشل في تحميل الملف:', error);
    throw new AppError('فشل في تحميل الملف إلى التخزين السحابي', 500);
  }
};

// تحميل ملف متعدد الأجزاء (للملفات الكبيرة)
const uploadLargeFile = async (file, destinationPath = '', options = {}) => {
  try {
    if (!storage) initCloudStorage();

    const { originalname, path: tempFilePath } = file;
    const fileExtension = path.extname(originalname).toLowerCase();
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = destinationPath ? `${destinationPath}/${fileName}` : fileName;

    const bucket = storage.bucket(bucketName);
    const blob = bucket.file(filePath);

    // خيارات التحميل
    const uploadOptions = {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: originalname,
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        },
      },
      ...options,
      resumable: true, // تفعيل التحميل القابل للاستئناف
    };

    // بدء التحميل القابل للاستئناف
    const [response] = await bucket.upload(tempFilePath, uploadOptions);

    // جعل الملف عاماً إذا كان مطلوباً
    if (options.public) {
      await blob.makePublic();
    }

    // حذف الملف المؤقت
    fs.unlinkSync(tempFilePath);


    // إرجاع معلومات الملف
    const [metadata] = await blob.getMetadata();
    const publicUrl = options.public ? blob.publicUrl() : null;

    return {
      fileName,
      filePath,
      publicUrl,
      contentType: metadata.contentType,
      size: metadata.size,
      metadata: metadata.metadata,
      bucket: bucketName,
    };
  } catch (error) {
    console.error('فشل في تحميل الملف الكبير:', error);
    throw new AppError('فشل في تحميل الملف الكبير إلى التخزين السحابي', 500);
  }
};

// حذف ملف من التخزين السحابي
const deleteFile = async (filePath) => {
  try {
    if (!storage) initCloudStorage();

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // التحقق من وجود الملف
    const [exists] = await file.exists();
    if (!exists) {
      throw new AppError('الملف غير موجود', 404);
    }

    // حذف الملف
    await file.delete();

    return { success: true, message: 'تم حذف الملف بنجاح' };
  } catch (error) {
    console.error('فشل في حذف الملف:', error);
    throw new AppError('فشل في حذف الملف من التخزين السحابي', 500);
  }
};

// إنشاء رابط توقيع للوصول المؤقت إلى ملف خاص
const generateSignedUrl = async (filePath, options = {}) => {
  try {
    if (!storage) initCloudStorage();

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // خيارات الرابط الموقع
    const opts = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + (options.expiresIn || 15 * 60 * 1000), // افتراضياً 15 دقيقة
      ...options,
    };

    // إنشاء الرابط الموقع
    const [url] = await file.getSignedUrl(opts);

    return { url, expires: new Date(opts.expires).toISOString() };
  } catch (error) {
    console.error('فشل في إنشاء رابط موقّع:', error);
    throw new AppError('فشل في إنشاء رابط مؤقت للملف', 500);
  }
};

// تنزيل ملف من التخزين السحابي
const downloadFile = async (filePath, destinationPath) => {
  try {
    if (!storage) initCloudStorage();

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // التأكد من وجود المجلد الهدف
    const dir = path.dirname(destinationPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // تنزيل الملف
    await file.download({ destination: destinationPath });

    return { success: true, path: destinationPath };
  } catch (error) {
    console.error('فشل في تنزيل الملف:', error);
    throw new AppError('فشل في تنزيل الملف من التخزين السحابي', 500);
  }
};

// سرد الملفات في مجلد معين
const listFiles = async (prefix = '', options = {}) => {
  try {
    if (!storage) initCloudStorage();

    const bucket = storage.bucket(bucketName);
    const [files] = await bucket.getFiles({
      prefix,
      ...options,
    });

    return files.map((file) => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      timeCreated: file.metadata.timeCreated,
      updated: file.metadata.updated,
      publicUrl: `https://storage.googleapis.com/${bucketName}/${file.name}`,
    }));
  } catch (error) {
    console.error('فشل في سرد الملفات:', error);
    throw new AppError('فشل في سرد الملفات من التخزين السحابي', 500);
  }
};

module.exports = {
  initCloudStorage,
  uploadFile,
  uploadLargeFile,
  deleteFile,
  generateSignedUrl,
  downloadFile,
  listFiles,
};
