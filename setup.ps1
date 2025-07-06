# تحقق من صلاحيات المسؤول
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  يلزم تشغيل البرنامج النصي كمسؤول" -ForegroundColor Yellow
    Write-Host "يرجى تشغيل PowerShell كمسؤول وإعادة المحاولة"
    Pause
    exit 1
}

# عرض عنوان التطبيق
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "  إعداد نظام إدارة نقاط البيع (POS)           " -ForegroundColor Cyan
Write-Host "  الإصدار 1.0.0                              " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من تثبيت Node.js
Write-Host "🔍 التحقق من تثبيت Node.js..." -NoNewline
$nodeVersion = node --version 2>$null

if (-not $nodeVersion) {
    Write-Host " ❌ غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "Node.js غير مثبت على جهازك." -ForegroundColor Yellow
    Write-Host "يرجى تثبيت Node.js من الموقع الرسمي:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/" -ForegroundColor Blue
    Write-Host ""
    $installNode = Read-Host "هل تريد فتح صفحة التحميل الآن؟ (نعم/لا)"
    
    if ($installNode -eq "نعم" -or $installNode -eq "ن" -or $installNode -eq "y" -or $installNode -eq "yes") {
        Start-Process "https://nodejs.org/"
    }
    
    exit 1
} else {
    Write-Host " ✅ موجود (الإصدار $nodeVersion)" -ForegroundColor Green
}

# التحقق من تثبيت PostgreSQL
Write-Host "🔍 التحقق من تثبيت PostgreSQL..." -NoNewline
$pgVersion = psql --version 2>$null

if (-not $pgVersion) {
    Write-Host " ❌ غير مثبت" -ForegroundColor Red
    Write-Host ""
    Write-Host "PostgreSQL غير مثبت على جهازك." -ForegroundColor Yellow
    Write-Host "يرجى تثبيت PostgreSQL من الموقع الرسمي:" -ForegroundColor Yellow
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Blue
    Write-Host ""
    $installPg = Read-Host "هل تريد فتح صفحة التحميل الآن؟ (نعم/لا)"
    
    if ($installPg -eq "نعم" -or $installPg -eq "ن" -or $installPg -eq "y" -or $installPg -eq "yes") {
        Start-Process "https://www.postgresql.org/download/windows/"
    }
    
    Write-Host ""
    Write-Host "⚠️  يرجى تثبيت PostgreSQL والمتابعة يدوياً" -ForegroundColor Yellow
    Pause
    exit 1
} else {
    Write-Host " ✅ موجود (الإصدار $($pgVersion -replace 'psql \(PostgreSQL\) '))" -ForegroundColor Green
}

# إنشاء ملف .env إذا لم يكن موجوداً
if (-not (Test-Path .\.env)) {
    Write-Host "⚙️  إنشاء ملف .env من المثال..." -NoNewline
    Copy-Item .\.env.example -Destination .\.env
    Write-Host " ✅" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "==============================================" -ForegroundColor Yellow
    Write-Host " ⚠️  يرجى تعديل ملف .env بإعدادات قاعدة البيانات المناسبة" -ForegroundColor Yellow
    Write-Host "==============================================" -ForegroundColor Yellow
    Write-Host ""
    
    $openEnv = Read-Host "هل تريد فتح ملف .env للتحرير الآن؟ (نعم/لا)"
    if ($openEnv -eq "نعم" -or $openEnv -eq "ن" -or $openEnv -eq "y" -or $openEnv -eq "yes") {
        notepad .\.env
    }
    
    Write-Host ""
    Write-Host "⏳ انتظر حتى تنتهي من تعديل ملف .ثم اضغط أي مفتاح للمتابعة..."
    $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
}

# تثبيت التبعيات
Write-Host ""
Write-Host "📦 جاري تثبيت تبعيات Node.js..." -NoNewline
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host " ❌ فشل في تثبيت التبعيات" -ForegroundColor Red
    Write-Host "يرجى تشغيل الأمر التالي يدوياً للتحقق من الخطأ:"
    Write-Host "npm install" -ForegroundColor Blue
    Pause
    exit 1
} else {
    Write-Host " ✅ تم التثبيت بنجاح" -ForegroundColor Green
}

# إعداد قاعدة البيانات
Write-Host ""
Write-Host "🛢️  جاري إعداد قاعدة البيانات..."
Write-Host "=============================================="

# تشغيل سكربت إعداد قاعدة البيانات
node .\scripts\setup-db.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ فشل في إعداد قاعدة البيانات" -ForegroundColor Red
    Write-Host "يرجى التحقق من إعدادات قاعدة البيانات في ملف .env"
    Pause
    exit 1
}

# تشغيل عمليات الهجرة
Write-Host ""
Write-Host "🔄 جاري تشغيل عمليات الهجرة..."
npx sequelize-cli db:migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ فشل في تشغيل عمليات الهجرة" -ForegroundColor Red
    Pause
    exit 1
}

# عرض رسالة النجاح
Write-Host ""
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host "✨ تم إعداد التطبيق بنجاح!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""
Write-Host "لتشغيل التطبيق، استخدم أحد الأوامر التالية:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. للتشغيل العادي:" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. لوضع التطوير (مع إعادة التشغيل التلقائي):" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. أو ببساطة انقر نقراً مزدوجاً على ملف start.bat" -ForegroundColor Cyan
Write-Host ""
Write-Host ""
Write-Host "بعد تشغيل الخادم، يمكنك الوصول إلى:" -ForegroundColor Yellow
Write-Host "- الواجهة الأمامية: http://localhost:3000" -ForegroundColor White
Write-Host "- وثائق API: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# انتظار ضغطة مفتاح
Pause
