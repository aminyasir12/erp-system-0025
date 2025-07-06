/**
 * نظام إدارة الأعمال - الملف الرئيسي للجافاسكريبت
 * يحتوي على الوظائف المشتركة بين جميع صفحات النظام
 */

// تهيئة التطبيق
class App {
  constructor() {
    // بيانات المستخدم الحالي (سيتم استبدالها بنظام تسجيل الدخول لاحقًا)
    this.currentUser = {
      id: 1,
      name: "أحمد محمد",
      role: "مدير",
      permissions: ["admin", "sales", "purchases", "inventory"]
    };

    // بيانات تجريبية للعملاء
    this.customers = [
      { id: 1, name: "أحمد محمد", phone: "0512345678", email: "ahmed@example.com", address: "الرياض، حي النزهة" },
      { id: 2, name: "سارة أحمد", phone: "0523456789", email: "sara@example.com", address: "جدة، حي الروضة" },
      { id: 3, name: "محمد علي", phone: "0534567890", email: "mohamed@example.com", address: "الدمام، حي الشاطئ" },
      { id: 4, name: "فاطمة محمد", phone: "0545678901", email: "fatima@example.com", address: "مكة، حي العزيزية" },
      { id: 5, name: "خالد أحمد", phone: "0556789012", email: "khaled@example.com", address: "المدينة، حي قباء" }
    ];

    // بيانات تجريبية للموردين
    this.suppliers = [
      { id: 1, name: "شركة الأمل للتجارة", contact: "سعيد محمد", phone: "0512345678", email: "info@alamal.com", address: "الرياض، المنطقة الصناعية" },
      { id: 2, name: "مؤسسة النور", contact: "نورة سعد", phone: "0523456789", email: "info@alnoor.com", address: "جدة، حي الصناعية" },
      { id: 3, name: "شركة الوطن للتوريدات", contact: "فهد العلي", phone: "0534567890", email: "info@alwatan.com", address: "الدمام، حي الصناعية الثانية" },
      { id: 4, name: "مؤسسة الخليج", contact: "سلمان الفارس", phone: "0545678901", email: "info@gulf.com", address: "الخبر، طريق الملك فهد" },
      { id: 5, name: "شركة المستقبل", contact: "ليلى الصالح", phone: "0556789012", email: "info@future.com", address: "أبها، المنطقة الصناعية" }
    ];

    // بيانات تجريبية للمنتجات
    this.products = [
      { id: 1, name: "لابتوب HP ProBook", category: "أجهزة كمبيوتر", price: 3500, cost: 2800, unit: "قطعة", stock: 15 },
      { id: 2, name: "طابعة Canon MF3010", category: "طابعات", price: 950, cost: 750, unit: "قطعة", stock: 8 },
      { id: 3, name: "جوال سامسونج جالكسي S21", category: "جوالات", price: 3200, cost: 2600, unit: "قطعة", stock: 12 },
      { id: 4, name: "شاشة LG 24 بوصة", category: "شاشات", price: 750, cost: 550, unit: "قطعة", stock: 20 },
      { id: 5, name: "لوحة مفاتيح لاسلكية", category: "ملحقات", price: 120, cost: 75, unit: "قطعة", stock: 30 },
      { id: 6, name: "ماوس لاسلكي", category: "ملحقات", price: 85, cost: 45, unit: "قطعة", stock: 40 },
      { id: 7, name: "سماعات بلوتوث", category: "ملحقات", price: 210, cost: 140, unit: "قطعة", stock: 25 },
      { id: 8, name: "حبر طابعة أسود", category: "مستهلكات", price: 180, cost: 120, unit: "قطعة", stock: 50 },
      { id: 9, name: "حبر طابعة ملون", category: "مستهلكات", price: 220, cost: 150, unit: "قطعة", stock: 35 },
      { id: 10, name: "كيبل HDMI", category: "ملحقات", price: 45, cost: 25, unit: "قطعة", stock: 60 }
    ];

    this.initEventListeners();
    this.checkAuth();
  }

  // تهيئة مستمعي الأحداث
  initEventListeners() {
    // تسجيل الخروج
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // القائمة المنسدلة للمستخدم
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
      userMenuBtn.addEventListener('click', () => {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
          userDropdown.classList.toggle('show');
        } else {
          console.log('تم النقر على قائمة المستخدم');
        }
      });
    }

    // إغلاق القوائم المنسدلة عند النقر خارجها
    document.addEventListener('click', (e) => {
      if (!e.target.matches('#userMenuBtn') && !e.target.closest('#userMenuBtn')) {
        const dropdowns = document.getElementsByClassName('dropdown-menu');
        for (let i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    });

    // تهيئة النوافذ المنبثقة
    this.initModals();
  }
  
  /**
   * تهيئة النوافذ المنبثقة
   */
  initModals() {
    // إضافة مستمعات أحداث لأزرار الإغلاق في النوافذ المنبثقة
    const closeButtons = document.querySelectorAll('.close, .close-btn, .btn-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
          this.closeModal(modal);
        }
      });
    });

    // إغلاق النافذة المنبثقة عند النقر خارجها
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      // إضافة فئة modal-dialog إذا لم تكن موجودة
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent && !modalContent.parentElement.classList.contains('modal-dialog')) {
        const modalDialog = document.createElement('div');
        modalDialog.className = 'modal-dialog';
        modalContent.parentNode.insertBefore(modalDialog, modalContent);
        modalDialog.appendChild(modalContent);
      }
      
      // إضافة مستمع للنقر خارج النافذة
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          this.closeModal(modal);
        }
      });
    });
    
    // إضافة مستمعات لأزرار فتح النوافذ المنبثقة
    document.querySelectorAll('[data-toggle="modal"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const target = button.getAttribute('data-target');
        const size = button.getAttribute('data-modal-size') || 'md';
        if (target) {
          this.openModal(target, size);
        }
      });
    });
    
    // تعديل النوافذ المنبثقة لتناسب الشاشات المتوسطة
    window.addEventListener('resize', () => {
      const openModals = document.querySelectorAll('.modal[style*="display: block"]');
      openModals.forEach(modal => this.adjustModalForMediumScreens(modal));
    });
  }

  // التحقق من حالة المصادقة
  async checkAuth() {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/forgot-password'];
    
    // للتطوير فقط: تجاهل التحقق من المصادقة
    console.log('تم تجاهل التحقق من المصادقة للتطوير');
    
    // تحديث واجهة المستخدم ببيانات المستخدم الحالي
    this.updateUI(this.currentUser);
    
    // تعليق الكود الأصلي مؤقتًا للتطوير
    /*
    if (!token && !publicPaths.includes(currentPath)) {
      // إذا لم يكن المستخدم مسجل الدخول وكان في صفحة محمية، قم بتوجيهه إلى صفحة تسجيل الدخول
      window.location.href = '/login';
    } else if (token && publicPaths.includes(currentPath)) {
      // إذا كان المستخدم مسجل الدخول وكان في صفحة عامة، قم بتوجيهه إلى لوحة التحكم
      window.location.href = '/dashboard';
    } else if (token) {
      // إذا كان مسجل الدخول، قم بجلب بيانات المستخدم
      await this.fetchUserData();
    }
    */
  }

  // جلب بيانات المستخدم
  async fetchUserData() {
    try {
      // للتطوير فقط: استخدام بيانات وهمية بدلاً من الاتصال بالخادم
      console.log('استخدام بيانات مستخدم وهمية للتطوير');
      
      // تحديث واجهة المستخدم بالبيانات الوهمية
      this.updateUI(this.currentUser);
      
      // تعليق الكود الأصلي مؤقتًا للتطوير
      /*
      const response = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.updateUI(data.data.user);
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      */
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // تحديث واجهة المستخدم ببيانات المستخدم
  updateUI(user) {
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      usernameElement.textContent = user.name;
    }

    // يمكنك إضافة المزيد من تحديثات واجهة المستخدم هنا
  }

  // تسجيل الخروج
  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  /**
   * فتح نافذة منبثقة
   * @param {HTMLElement|string} modal - عنصر النافذة المنبثقة أو معرفها
   * @param {string} size - حجم النافذة (sm, md, lg, xl)
   */
  openModal(modal, size = 'md') {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    
    if (modal) {
      // إضافة الفئات المناسبة للحجم
      if (size && !modal.classList.contains(`modal-${size}`)) {
        modal.classList.add(`modal-${size}`);
      }
      
      // إضافة فئة التحريك
      modal.classList.add('animate-in');
      
      // عرض النافذة
      modal.style.display = 'block';
      
      // إضافة فئة العرض بعد فترة قصيرة للسماح بالتحريك
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
      
      // منع التمرير في الصفحة الخلفية
      document.body.style.overflow = 'hidden';
      
      // التأكد من أن النافذة تظهر في المنتصف على الشاشات المتوسطة
      this.adjustModalForMediumScreens(modal);
      
      // إضافة مستمع لتعديل حجم النافذة
      window.addEventListener('resize', () => this.adjustModalForMediumScreens(modal));
    }
  }

  /**
   * إغلاق نافذة منبثقة
   * @param {HTMLElement|string} modal - عنصر النافذة المنبثقة أو معرفها
   */
  closeModal(modal) {
    if (typeof modal === 'string') {
      modal = document.getElementById(modal);
    }
    
    if (modal) {
      // إضافة فئة التحريك للخروج
      modal.classList.remove('animate-in');
      modal.classList.add('animate-out');
      modal.classList.remove('show');
      
      // إخفاء النافذة بعد انتهاء التحريك
      setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('animate-out');
        document.body.style.overflow = ''; // استعادة التمرير في الصفحة الخلفية
      }, 300);
      
      // إزالة مستمع تعديل حجم النافذة
      window.removeEventListener('resize', () => this.adjustModalForMediumScreens(modal));
    }
  }
  
  /**
   * تعديل النافذة المنبثقة لتناسب الشاشات المتوسطة
   * @param {HTMLElement} modal - عنصر النافذة المنبثقة
   */
  adjustModalForMediumScreens(modal) {
    if (!modal) return;
    
    const modalDialog = modal.querySelector('.modal-dialog') || modal.querySelector('.modal-content').parentNode;
    if (!modalDialog) return;
    
    // إعادة تعيين أي أنماط سابقة
    modalDialog.style.maxHeight = '';
    modalDialog.style.overflowY = '';
    
    // تعديل الارتفاع للشاشات المتوسطة
    if (window.innerWidth <= 992) {
      const windowHeight = window.innerHeight;
      const modalHeight = modalDialog.offsetHeight;
      
      if (modalHeight > windowHeight * 0.9) {
        modalDialog.style.maxHeight = `${windowHeight * 0.9}px`;
        modalDialog.style.overflowY = 'auto';
      }
    }
  }

  /**
   * تنسيق الأرقام كعملة
   * @param {number} amount - المبلغ
   * @param {string} currency - رمز العملة (افتراضيًا: ريال)
   * @returns {string} - المبلغ منسقًا كعملة
   */
  formatCurrency(amount, currency = 'ريال') {
    return amount.toLocaleString('ar-SA') + ' ' + currency;
  }

  /**
   * تنسيق التاريخ بالصيغة العربية
   * @param {string|Date} date - التاريخ
   * @returns {string} - التاريخ منسقًا
   */
  formatDate(date) {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * إنشاء عنصر HTML من نص
   * @param {string} html - نص HTML
   * @returns {HTMLElement} - عنصر HTML
   */
  createElementFromHTML(html) {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
  }

  /**
   * عرض رسالة تنبيه للمستخدم
   * @param {string} message - نص الرسالة
   * @param {string} type - نوع الرسالة (success, error, warning, info)
   * @param {number} duration - مدة ظهور الرسالة بالمللي ثانية
   */
  showNotification(message, type = 'info', duration = 3000) {
    // إنشاء عنصر التنبيه
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // إضافة أيقونة حسب نوع الرسالة
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    else if (type === 'error') icon = 'fa-exclamation-circle';
    else if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    // إضافة العنصر إلى الصفحة
    document.body.appendChild(notification);
    
    // إظهار التنبيه
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // إخفاء التنبيه بعد المدة المحددة
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }

  // عرض رسالة للمستخدم (للتوافق مع الكود القديم)
  showMessage(message, type = 'success') {
    this.showNotification(message, type);
  }

  /**
   * التحقق من صحة المدخلات
   * @param {HTMLFormElement} form - نموذج الإدخال
   * @returns {boolean} - صحة المدخلات
   */
  validateForm(form) {
    let isValid = true;
    
    // التحقق من الحقول المطلوبة
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        
        // إضافة رسالة خطأ
        const errorMessage = field.dataset.errorMessage || 'هذا الحقل مطلوب';
        let errorElement = field.parentElement.querySelector('.error-message');
        
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'error-message';
          field.parentElement.appendChild(errorElement);
        }
        
        errorElement.textContent = errorMessage;
      } else {
        field.classList.remove('error');
        const errorElement = field.parentElement.querySelector('.error-message');
        if (errorElement) {
          errorElement.remove();
        }
      }
    });
    
    return isValid;
  }
  
  /**
   * عرض إشعار للمستخدم
   * @param {string} message - نص الإشعار
   * @param {string} type - نوع الإشعار (success, error, warning, info)
   * @param {number} duration - مدة ظهور الإشعار بالمللي ثانية
   */
  showNotification(message, type = 'info', duration = 3000) {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // إضافة أيقونة مناسبة حسب النوع
    let icon = '';
    switch (type) {
      case 'success':
        icon = '<i class="fas fa-check-circle"></i>';
        break;
      case 'error':
        icon = '<i class="fas fa-times-circle"></i>';
        break;
      case 'warning':
        icon = '<i class="fas fa-exclamation-triangle"></i>';
        break;
      default:
        icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // إضافة المحتوى
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-message">${message}</div>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // إضافة الإشعار إلى الصفحة
    let notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) {
      notificationsContainer = document.createElement('div');
      notificationsContainer.className = 'notifications-container';
      document.body.appendChild(notificationsContainer);
    }
    
    notificationsContainer.appendChild(notification);
    
    // إضافة مستمع لزر الإغلاق
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
          notification.remove();
        }, 300);
      });
    }
    
    // إظهار الإشعار بتأثير متحرك
    setTimeout(() => {
      notification.classList.add('notification-show');
    }, 10);
    
    // إخفاء الإشعار تلقائيًا بعد المدة المحددة
    setTimeout(() => {
      notification.classList.add('notification-hiding');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  
  // تهيئة النوافذ المنبثقة بعد تحميل الصفحة
  if (window.app) {
    // إعادة تهيئة النوافذ المنبثقة عند إضافة محتوى جديد للصفحة
    setTimeout(() => {
      window.app.initModals();
    }, 100);
  }
});
