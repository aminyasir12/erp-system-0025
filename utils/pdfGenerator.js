const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const AppError = require('./AppError');

class PDFGenerator {
  constructor() {
    this.tempDir = path.join(__dirname, '../public/temp');
    this.ensureTempDirExists();
  }

  // التأكد من وجود مجلد الملفات المؤقتة
  ensureTempDirExists() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // تنظيف الملفات القديمة
  async cleanupOldFiles(maxAge = 24 * 60 * 60 * 1000) { // افتراضياً 24 ساعة
    try {
      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      
      files.forEach(file => {
        const filePath = path.join(this.tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.birthtimeMs > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('خطأ أثناء تنظيف الملفات المؤقتة:', error);
    }
  }

  // إنشاء ملف PDF من HTML
  async generateFromHtml(html, options = {}) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      
      // تعيين خيارات الصفحة
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000, // 30 ثانية كحد أقصى
      });

      // تعيين خيارات الطباعة
      const pdfOptions = {
        path: options.path || path.join(this.tempDir, `${uuidv4()}.pdf`),
        format: options.format || 'A4',
        printBackground: options.printBackground || true,
        margin: options.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
        preferCSSPageSize: options.preferCSSPageSize || false,
        ...options,
      };

      // إنشاء ملف PDF
      const pdf = await page.pdf(pdfOptions);
      
      // إرجاع المسار إذا تم تحديده، وإلا إرجاع الـ buffer
      return pdfOptions.path ? pdfOptions.path : pdf;
    } catch (error) {
      console.error('خطأ أثناء إنشاء ملف PDF:', error);
      throw new AppError('فشل في إنشاء ملف PDF', 500);
    } finally {
      await browser.close();
    }
  }

  // إنشاء ملف PDF من ملف HTML
  async generateFromHtmlFile(htmlPath, data = {}, options = {}) {
    try {
      // قراءة ملف HTML
      const templatePath = path.join(__dirname, '../views', htmlPath);
      let html = fs.readFileSync(templatePath, 'utf8');
      
      // استبدال المتغيرات في القالب
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
      });

      // إنشاء ملف PDF
      return this.generateFromHtml(html, options);
    } catch (error) {
      console.error('خطأ في قراءة ملف HTML:', error);
      throw new AppError('فشل في قراءة ملف القالب', 500);
    }
  }

  // حذف ملف PDF
  deletePdf(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ أثناء حذف ملف PDF:', error);
      return false;
    }
  }
}

// تصدير نسخة واحدة من الفئة
module.exports = new PDFGenerator();
