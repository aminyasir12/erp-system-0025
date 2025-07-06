class ApiResponse {
  /**
   * إنشاء رد ناجح
   * @param {Object} res - كائن الاستجابة من Express
   * @param {*} data - البيانات المراد إرجاعها
   * @param {string} message - رسالة نجاح اختيارية
   * @param {number} statusCode - رمز الحالة الافتراضي 200
   */
  static success(res, data = null, message = 'تمت العملية بنجاح', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * إنشاء رد خطأ
   * @param {Object} res - كائن الاستجابة من Express
   * @param {string} message - رسالة الخطأ
   * @param {number} statusCode - رمز الحالة الافتراضي 400
   * @param {*} errors - أخطاء إضافية
   */
  static error(res, message = 'حدث خطأ ما', statusCode = 400, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors ? (Array.isArray(errors) ? errors : [errors]) : undefined,
    });
  }

  /**
   * إنشاء رد صفحة
   * @param {Object} res - كائن الاستجابة من Express
   * @param {Array} items - العناصر الحالية للصفحة
   * @param {number} totalItems - إجمالي عدد العناصر
   * @param {number} page - رقم الصفحة الحالية
   * @param {number} limit - عدد العناصر في الصفحة
   * @param {string} message - رسالة نجاح اختيارية
   */
  static paginated(res, items, totalItems, page, limit, message = 'تم استرجاع البيانات بنجاح') {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return res.status(200).json({
      success: true,
      message,
      data: items,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
      },
    });
  }

  /**
   * إنشاء استجابة لتحميل ملف
   * @param {Object} res - كائن الاستجابة من Express
   * @param {string} filePath - مسار الملف
   * @param {string} fileName - اسم الملف الذي سيظهر للمستخدم
   * @param {string} contentType - نوع المحتوى (اختياري)
   */
  static file(res, filePath, fileName, contentType = 'application/octet-stream') {
    return res.download(filePath, fileName, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  }

  /**
   * إنشاء استجابة JSON مع رأس ETag للتخزين المؤقت
   * @param {Object} res - كائن الاستجابة من Express
   * @param {*} data - البيانات المراد تخزينها مؤقتاً
   * @param {string} etag - معرف ETag
   * @param {number} maxAge - مدة التخزين المؤقت بالثواني
   */
  static cached(res, data, etag, maxAge = 3600) {
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      ETag: etag,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  }
}

module.exports = ApiResponse;
