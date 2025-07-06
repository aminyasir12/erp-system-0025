@echo off
echo ==============================================
echo  بدء تشغيل نظام إدارة نقاط البيع (POS)
echo ==============================================

:: تعيين متغيرات البيئة
echo ⚙️  جاري تعيين متغيرات البيئة...
set NODE_ENV=development
set DEBUG=app:*,sequelize:*

:: التحقق من تثبيت Node.js
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ خطأ: يبدو أن Node.js غير مثبت على جهازك
    echo يرجى تثبيت Node.js من الموقع الرسمي: https://nodejs.org/
    pause
    exit /b 1
)

:: التحقق من تثبيت npm
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ خطأ: يبدو أن npm غير مثبت على جهازك
    echo يرجى تثبيت Node.js ليتضمن npm
    pause
    exit /b 1
)

:: تثبيت التبعيات
echo 📦 جاري تثبيت التبعيات...
npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ فشل في تثبيت التبعيات
    pause
    exit /b 1
)

:: إنشاء ملف .env إذا لم يكن موجوداً
if not exist .env (
    echo ⚙️  إنشاء ملف .env من المثال...
    copy .env.example .env
    echo ⚠️  يرجى تعديل ملف .env بإعدادات قاعدة البيانات المناسبة
    pause
)

:: تشغيل التطبيق
echo 🚀 بدء تشغيل التطبيق...
node start.js

:: في حالة حدوث خطأ
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ حدث خطأ أثناء تشغيل التطبيق
    echo 🔍 تحقق من سجلات الأخطاء أعلاه لمزيد من المعلومات
)

pause
