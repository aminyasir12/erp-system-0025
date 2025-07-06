/**
 * تحسينات إضافية لواجهة المستخدم لنظام نقاط البيع
 */

// تهيئة التأثيرات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // تحميل خطوط Google Fonts
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
  
  // تطبيق الخط على العناصر
  document.body.style.fontFamily = '"Tajawal", sans-serif';
  
  // إضافة تأثيرات للعناصر التفاعلية
  addHoverEffects();
  
  // تهيئة أزرار الإجراءات
  initActionButtons();
  
  // تحسين تجربة اللمس على الأجهزة المحمولة
  if ('ontouchstart' in window) {
    enhanceTouchExperience();
  }
});

// إضافة تأثيرات التحويم للعناصر
function addHoverEffects() {
  // تأثيرات لأزرار الإجراءات
  const actionButtons = document.querySelectorAll('.btn-action');
  actionButtons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
    
    button.addEventListener('mousedown', function() {
      this.style.transform = 'translateY(1px)';
    });
    
    button.addEventListener('mouseup', function() {
      this.style.transform = 'translateY(-2px)';
    });
  });
  
  // تأثيرات البطاقات
  const cards = document.querySelectorAll('.card-hover');
  cards.forEach(card => {
    card.style.transition = 'all 0.3s ease';
    
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
}

// تهيئة أزرار الإجراءات
function initActionButtons() {
  // إضافة تأثير النقر على جميع الأزرار
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      // إضافة تأثير النقر
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size/2}px`;
      ripple.style.top = `${e.clientY - rect.top - size/2}px`;
      ripple.classList.add('ripple-effect');
      
      this.appendChild(ripple);
      
      // إزالة العنصر بعد انتهاء التأثير
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // إضافة تأثير التحميل للأزرار عند النقر
  const submitButtons = document.querySelectorAll('button[type="submit"]');
  submitButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (this.classList.contains('loading')) return;
      
      const originalText = this.innerHTML;
      this.innerHTML = `
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        جاري المعالجة...
      `;
      this.classList.add('loading');
      
      // إعادة تعيين الزر بعد 5 ثواني كحد أقصى
      setTimeout(() => {
        this.innerHTML = originalText;
        this.classList.remove('loading');
      }, 5000);
    });
  });
}

// تحسين تجربة اللمس على الأجهزة المحمولة
function enhanceTouchExperience() {
  // تحسين تجربة اللمس للأزرار
  const buttons = document.querySelectorAll('.btn, .btn-action, [role="button"]');
  buttons.forEach(button => {
    button.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
    button.style.webkitUserSelect = 'none';
    button.style.msTouchAction = 'manipulation';
    button.style.touchAction = 'manipulation';
  });
  
  // منع التكبير/التصغير المزدوج
  document.documentElement.style.touchAction = 'manipulation';
  
  // تحسين تجربة الإدخال على الشاشات الصغيرة
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      // تأخير تمرير العنصر إلى العرض
      setTimeout(() => {
        this.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    });
  });
}

// دالة لعرض رسائل التنبيه
function showAlert(message, type = 'info', duration = 5000) {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="${getAlertIcon(type)} me-2"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="إغلاق"></button>
    </div>
  `;
  
  const container = document.getElementById('alertsContainer') || document.body;
  container.prepend(alert);
  
  // إضافة تأثير الظهور
  setTimeout(() => alert.classList.add('show'), 10);
  
  // إخفاء التنبيه بعد المدة المحددة
  if (duration > 0) {
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 300);
    }, duration);
  }
  
  return alert;
}

// الحصول على أيقونة التنبيه المناسبة
function getAlertIcon(type) {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  };
  return icons[type] || 'fas fa-info-circle';
}

// تهيئة أداة التلميحات
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl, {
      trigger: 'hover focus',
      placement: 'top',
      container: 'body',
      animation: true
    });
  });
}

// تصدير الدوال للاستخدام في ملفات أخرى
window.POSEnhancements = {
  showAlert,
  initTooltips,
  enhanceTouchExperience
};

// تهيئة التأثيرات عند تحميل الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.POSEnhancements.initTooltips();
  });
} else {
  window.POSEnhancements.initTooltips();
}
