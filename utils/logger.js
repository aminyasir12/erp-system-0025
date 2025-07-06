const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

// إنشاء مجلد السجلات إذا لم يكن موجوداً
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// تنسيق السجلات
const logFormat = printf(({ level, message, timestamp, stack }) => {
  let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
  if (stack) {
    logMessage += `\n${stack}`;
  }
  return logMessage;
});

// تهيئة اللوغر
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  defaultMeta: { service: 'business-management-system' },
  transports: [
    // كتابة سجلات الأخطاء في ملف error.log
    new DailyRotateFile({
      level: 'error',
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
    // كتابة جميع السجلات في ملف combined.log
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// إذا لم نكن في بيئة الإنتاج، أضف اللوغارتم في الكونسول
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

// دالة لتسجيل طلبات HTTP
const httpLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(logMessage);
    } else {
      logger.info(logMessage);
    }
  });
  
  next();
};

module.exports = {
  logger,
  httpLogger,
};
