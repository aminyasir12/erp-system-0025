/**
 * لوحة تحكم نقاط البيع - نظام إدارة المتاجر
 * هذا الملف يحتوي على الوظائف الأساسية لإدارة لوحة تحكم نقاط البيع
 */

// كائن التطبيق الرئيسي
const POSDashboard = {
  // تهيئة التطبيق
  init() {
    this.initEventListeners();
    this.loadDashboardData();
    this.setupRealTimeUpdates();
    this.checkLowInventory();
    this.setupPOSEventListeners();
    this.loadProducts();
    this.loadCustomers();
  },
  
  // إعداد مستمعي أحداث نقاط البيع
  setupPOSEventListeners() {
    // البحث عن المنتجات
    $('#productSearch').on('select2:select', (e) => this.addToCart(e.params.data));
    
    // حذف عنصر من السلة
    $(document).on('click', '.remove-item', (e) => {
      const itemId = $(e.currentTarget).data('id');
      this.removeFromCart(itemId);
    });
    
    // تحديث كمية العنصر في السلة
    $(document).on('change', '.item-quantity', (e) => {
      const itemId = $(e.currentTarget).data('id');
      const newQuantity = parseInt($(e.currentTarget).val());
      this.updateCartItemQuantity(itemId, newQuantity);
    });
    
    // تطبيق الخصم
    $('#applyDiscountBtn').on('click', () => this.applyDiscount());
    
    // اختيار العميل
    $('#customerSelect').on('change', (e) => {
      this.currentCustomer = e.target.value ? parseInt(e.target.value) : null;
    });
    
    // زر إنهاء عملية البيع
    $('#completeSaleBtn').on('click', () => this.completeSale());
  },
  
  // تحميل قائمة المنتجات
  async loadProducts() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      
      // تهيئة Select2 للبحث عن المنتجات
      $('#productSearch').select2({
        placeholder: 'ابحث عن منتج...',
        allowClear: true,
        data: products.map(p => ({
          id: p.id,
          text: `${p.name} (${p.code || p.barcode}) - ${p.price} ر.س`,
          price: p.price,
          stock: p.quantityInStock
        })),
        language: {
          noResults: () => 'لا توجد نتائج',
          searching: () => 'جاري البحث...'
        }
      });
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('حدث خطأ أثناء تحميل المنتجات');
    }
  },
  
  // تحميل قائمة العملاء
  async loadCustomers() {
    try {
      const response = await fetch('/api/customers');
      const customers = await response.json();
      
      const select = $('#customerSelect');
      select.empty();
      select.append('<option value="">اختر عميلاً (اختياري)</option>');
      
      customers.forEach(customer => {
        select.append(`<option value="${customer.id}">${customer.name} - ${customer.phone || ''}</option>`);
      });
    } catch (error) {
      console.error('Error loading customers:', error);
      this.showError('حدث خطأ أثناء تحميل قائمة العملاء');
    }
  },

  // إضافة منتج إلى سلة المشتريات
  addToCart(productData) {
    const existingItem = this.cart.find(item => item.id === productData.id);
    
    if (existingItem) {
      // إذا كان المنتج موجوداً بالفعل في السلة، قم بزيادة الكمية
      if (existingItem.quantity < existingItem.stock) {
        existingItem.quantity += 1;
        existingItem.total = existingItem.quantity * existingItem.price;
      } else {
        this.showError('الكمية المطلوبة غير متوفرة في المخزون');
        return;
      }
    } else {
      // إضافة منتج جديد إلى السلة
      const newItem = {
        id: productData.id,
        name: productData.text.split(' - ')[0],
        price: productData.price,
        quantity: 1,
        total: productData.price,
        stock: productData.stock
      };
      this.cart.push(newItem);
    }
    
    this.updateCartUI();
    $('#productSearch').val(null).trigger('change');
  },
  
  // حذف عنصر من سلة المشتريات
  removeFromCart(itemId) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.updateCartUI();
  },
  
  // تحديث كمية عنصر في سلة المشتريات
  updateCartItemQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
      this.removeFromCart(itemId);
      return;
    }
    
    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      if (newQuantity > item.stock) {
        this.showError('الكمية المطلوبة غير متوفرة في المخزون');
        $(`#cartItem_${itemId}`).val(item.quantity);
        return;
      }
      
      item.quantity = newQuantity;
      item.total = item.quantity * item.price;
      this.updateCartUI();
    }
  },
  
  // تطبيق خصم على الفاتورة
  applyDiscount() {
    const discountType = $('#discountType').val();
    const discountValue = parseFloat($('#discountValue').val()) || 0;
    
    if (discountValue <= 0) {
      this.showError('الرجاء إدخال قيمة خصم صحيحة');
      return;
    }
    
    this.discount = {
      type: discountType,
      value: discountValue
    };
    
    this.updateCartUI();
    $('#discountModal').modal('hide');
  },
  
  // تحديث واجهة مستخدم سلة المشتريات مع تأثيرات تفاعلية
  updateCartUI() {
    // تأثير تحديث السلة
    const $cartContainer = $('#cartContainer');
    $cartContainer.addClass('cart-updating');
    setTimeout(() => $cartContainer.removeClass('cart-updating'), 300);
    
    // تحديث عدد العناصر في زر السلة
    const $cartBadge = $('.cart-badge');
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalItems > 0) {
      $cartBadge.text(totalItems).show();
      // تأثير النبض عند إضافة عنصر جديد
      $cartBadge.addClass('pulse');
      setTimeout(() => $cartBadge.removeClass('pulse'), 500);
    } else {
      $cartBadge.hide();
    }
    const cartTable = $('#cartItems');
    const cartTotal = $('#cartTotal');
    const cartCount = $('#cartItemCount');
    
    // مسح المحتوى الحالي
    cartTable.empty();
    
    let subtotal = 0;
    
    // إضافة العناصر إلى الجدول
    this.cart.forEach((item, index) => {
      subtotal += item.total;
      
      const row = `
        <tr id="cartItem_${item.id}">
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>${item.price.toFixed(2)} ر.س</td>
          <td>
            <input type="number" class="form-control form-control-sm item-quantity" 
                   data-id="${item.id}" value="${item.quantity}" min="1" max="${item.stock}">
          </td>
          <td>${item.total.toFixed(2)} ر.س</td>
          <td>
            <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}" title="حذف">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
      
      cartTable.append(row);
    });
    
    // حساب الخصم
    let discountAmount = 0;
    if (this.discount.value > 0) {
      if (this.discount.type === 'percentage') {
        discountAmount = (subtotal * this.discount.value) / 100;
      } else {
        discountAmount = Math.min(this.discount.value, subtotal);
      }
    }
    
    // حساب الضرائب (15% ضريبة القيمة المضافة)
    const taxRate = 0.15;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * taxRate;
    const total = taxableAmount + tax;
    
    // تحديث الإجماليات
    $('#subtotalAmount').text(subtotal.toFixed(2) + ' ر.س');
    
    if (discountAmount > 0) {
      $('#discountRow').show();
      $('#discountAmount').text(`-${discountAmount.toFixed(2)} ر.س`);
    } else {
      $('#discountRow').hide();
    }
    
    $('#taxAmount').text(tax.toFixed(2) + ' ر.س');
    cartTotal.text(total.toFixed(2) + ' ر.س');
    cartCount.text(this.cart.reduce((sum, item) => sum + item.quantity, 0));
    
    // تفعيل/تعطيل زر إتمام البيع
    $('#completeSaleBtn').prop('disabled', this.cart.length === 0);
  },
  
  // إعداد مستمعي الأحداث
  initEventListeners() {
    // زر إضافة مبيعات جديدة
    document.getElementById('newSaleBtn')?.addEventListener('click', () => this.showNewSaleModal());
    
    // أزرار التصفية
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.filterSales(e));
    });
    
    // تحديث البيانات يدوياً
    document.getElementById('refreshData')?.addEventListener('click', () => this.loadDashboardData());
  },

  // تحميل بيانات لوحة التحكم
  async loadDashboardData() {
    try {
      this.showLoading(true);
      
      // تحميل إحصائيات المبيعات
      const statsResponse = await fetch('/api/dashboard/stats');
      const statsData = await statsResponse.json();
      this.updateStatsCards(statsData);
      
      // تحميل أحدث المبيعات
      const salesResponse = await fetch('/api/sales/recent');
      const salesData = await salesResponse.json();
      this.updateRecentSalesTable(salesData);
      
      // تحميل المنتجات منخفضة المخزون
      const inventoryResponse = await fetch('/api/inventory/low-stock');
      const inventoryData = await inventoryResponse.json();
      this.updateLowStockList(inventoryData);
      
      // تحميل الإشعارات
      this.checkNotifications();
      
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      this.showError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      this.showLoading(false);
    }
  },

  // تحديث بطاقات الإحصائيات
  updateStatsCards(stats) {
    if (stats.totalSales) {
      document.querySelector('#statsCards .total-sales').textContent = stats.totalSales.toLocaleString();
    }
    if (stats.totalCustomers) {
      document.querySelector('#statsCards .total-customers').textContent = stats.totalCustomers.toLocaleString();
    }
    if (stats.lowStockItems) {
      document.querySelector('#statsCards .low-stock-count').textContent = stats.lowStockItems;
    }
  },

  // تحديث جدول أحدث المبيعات
  updateRecentSalesTable(sales) {
    const tbody = document.querySelector('#recentSalesTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = sales.map(sale => `
      <tr>
        <td>#${sale.invoiceNumber}</td>
        <td>${sale.customerName || 'زائر'}</td>
        <td>${sale.posLocation}</td>
        <td>${sale.total.toLocaleString()} ر.س</td>
        <td><span class="badge ${sale.status === 'مكتمل' ? 'bg-success' : 'bg-warning'}">${sale.status}</span></td>
        <td>${this.formatTimeAgo(sale.date)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary print-invoice" data-id="${sale.id}">
            <i class="fas fa-print"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary view-details" data-id="${sale.id}">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
    // إضافة مستمعي الأحداث للأزرار الجديدة
    this.setupTableEventListeners();
  },

  // تحديث قائمة المنتجات منخفضة المخزون
  updateLowStockList(products) {
    const container = document.querySelector('#lowStockList');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
      <a href="#" class="list-group-item list-group-item-action low-stock-item" data-id="${product.id}">
        <div class="d-flex w-100 justify-content-between">
          <h6 class="mb-1">${product.name}</h6>
          <small class="text-danger">${product.quantity} متبقي</small>
        </div>
        <small class="text-muted">الحد الأدنى: ${product.minimumStock}</small>
        <div class="progress mt-1" style="height: 5px;">
          <div class="progress-bar bg-danger" style="width: ${(product.quantity / product.minimumStock) * 100}%;"></div>
        </div>
      </a>
    `).join('');
    
    // إضافة مستمعي الأحداث للعناصر الجديدة
    this.setupLowStockEventListeners();
  },

  // إعداد التحديثات المباشرة
  setupRealTimeUpdates() {
    // يمكن استخدام WebSocket أو Server-Sent Events للتحديث الفوري
    // هذا مثال باستخدام setInterval للتبسيط
    setInterval(() => {
      this.loadDashboardData();
    }, 300000); // تحديث كل 5 دقائق
    
    // يمكن تفعيل هذا في بيئة الإنتاج:
    // this.setupWebSocket();
  },

  // فحص المخزون المنخفض
  async checkLowInventory() {
    try {
      const response = await fetch('/api/inventory/low-stock');
      const data = await response.json();
      
      if (data.length > 0) {
        this.showLowStockNotification(data);
      }
    } catch (error) {
      console.error('خطأ في فحص المخزون:', error);
    }
  },

  // عرض إشعار المخزون المنخفض
  showLowStockNotification(products) {
    const alertContainer = document.getElementById('alertsContainer');
    if (!alertContainer) return;
    
    const alert = document.createElement('div');
    alert.className = 'alert alert-warning alert-dismissible fade show';
    alert.role = 'alert';
    alert.innerHTML = `
      <strong>تنبيه!</strong> هناك ${products.length} منتج بكميات منخفضة.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="إغلاق"></button>
      <hr>
      <ul class="mb-0">
        ${products.slice(0, 3).map(p => `<li>${p.name} - ${p.quantity} متبقي (الحد الأدنى: ${p.minimumStock})</li>`).join('')}
        ${products.length > 3 ? '<li>والمزيد...</li>' : ''}
      </ul>
    `;
    
    alertContainer.prepend(alert);
    
    // تحديث عداد التنبيهات
    this.updateAlertCount(products.length);
    
    // تشغيل صوت تنبيه
    this.playNotificationSound();
  },

  // تحديث عداد التنبيهات
  updateAlertCount(count) {
    const alertCount = document.getElementById('alertCount');
    if (alertCount) {
      alertCount.textContent = count;
      alertCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
  },

  // تشغيل صوت التنبيه
  playNotificationSound() {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(e => console.error('تعذر تشغيل صوت التنبيه:', e));
  },

  // تنسيق الوقت المنقضي
  formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `منذ ${interval} سنة`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `منذ ${interval} شهر`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `منذ ${interval} يوم`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `منذ ${interval} ساعة`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `منذ ${interval} دقيقة`;
    
    return 'الآن';
  },

  // عرض/إخفاء مؤشر التحميل
  showLoading(show) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  },

  // إكمال عملية البيع
  async completeSale() {
    if (this.cart.length === 0) {
      this.showError('السلة فارغة. الرجاء إضافة منتجات قبل إتمام البيع');
      return;
    }
    
    const paymentMethod = $('input[name="paymentMethod"]:checked').val();
    const notes = $('#saleNotes').val();
    
    try {
      this.showLoading(true);
      
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          customerId: this.currentCustomer,
          items: this.cart.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            unitPrice: item.price
          })),
          paymentMethod,
          notes,
          discount: this.discount.value > 0 ? this.discount : null
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'حدث خطأ أثناء إتمام عملية البيع');
      }
      
      const result = await response.json();
      
      // عرض إشعار النجاح
      this.showSuccess('تمت عملية البيع بنجاح');
      
      // طباعة الفاتورة
      this.printReceipt(result.data.sale);
      
      // إعادة تعيين النموذج
      this.resetSaleForm();
      
      // تحديث البيانات
      this.loadDashboardData();
      
    } catch (error) {
      console.error('Error completing sale:', error);
      this.showError(error.message || 'حدث خطأ أثناء إتمام عملية البيع');
    } finally {
      this.showLoading(false);
    }
  },
  
  // طباعة الإيصال
  printReceipt(sale) {
    // يمكنك تنفيذ منطق طباعة الإيصال هنا
    // هذا مثال بسيط لعرض بيانات الفاتورة في نافذة منبثقة
    const receiptWindow = window.open('', '_blank');
    
    const receiptContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة مبيعات #${sale.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .receipt { max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .info { margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
          .total { font-weight: bold; font-size: 1.2em; text-align: left; }
          .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>فاتورة مبيعات</h2>
            <p>#${sale.invoiceNumber}</p>
            <p>${new Date(sale.saleDate).toLocaleString('ar-SA')}</p>
          </div>
          
          <div class="info">
            <p><strong>طريقة الدفع:</strong> ${sale.paymentMethod}</p>
            ${sale.customerId ? `<p><strong>العميل:</strong> ${sale.Customer?.name || 'غير معروف'}</p>` : ''}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>المجموع</th>
              </tr>
            </thead>
            <tbody>
              ${sale.SaleItems?.map(item => `
                <tr>
                  <td>${item.Product?.name || 'منتج محذوف'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice.toFixed(2)} ر.س</td>
                  <td>${(item.quantity * item.unitPrice).toFixed(2)} ر.س</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="total">المجموع الفرعي:</td>
                <td>${sale.subtotal.toFixed(2)} ر.س</td>
              </tr>
              ${sale.discountValue > 0 ? `
                <tr>
                  <td colspan="3" class="total">الخصم:</td>
                  <td>-${sale.discountValue.toFixed(2)} ${sale.discountType === 'percentage' ? '%' : 'ر.س'}</td>
                </tr>
              ` : ''}
              <tr>
                <td colspan="3" class="total">الضريبة (15%):</td>
                <td>${sale.taxAmount.toFixed(2)} ر.س</td>
              </tr>
              <tr>
                <td colspan="3" class="total">الإجمالي:</td>
                <td>${sale.total.toFixed(2)} ر.س</td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>شكراً لتعاملكم معنا</p>
            <p>للاستفسار: 0123456789</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    receiptWindow.document.open();
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    
    // طباعة الفاتورة بعد تحميل الصفحة
    receiptWindow.onload = function() {
      setTimeout(() => {
        receiptWindow.print();
      }, 500);
    };
  },
  
  // إعادة تعيين نموذج البيع
  resetSaleForm() {
    this.cart = [];
    this.currentCustomer = null;
    this.discount = { type: 'percentage', value: 0 };
    $('#customerSelect').val('').trigger('change');
    $('#saleNotes').val('');
    $('input[name="paymentMethod"][value="نقدي"]').prop('checked', true);
    this.updateCartUI();
  },
  
  // عرض رسالة نجاح مع تأثيرات
  showSuccess(message, options = {}) {
    const { autoHide = true, duration = 3000 } = options;
    
    if (typeof toastr !== 'undefined') {
      toastr.success(message, 'نجاح', { 
        timeOut: autoHide ? duration : 0,
        extendedTimeOut: 1000,
        closeButton: !autoHide,
        progressBar: true,
        positionClass: 'toast-top-left',
        rtl: true
      });
    } else {
      const alertContainer = document.getElementById('alertsContainer');
      if (alertContainer) {
        const alertId = 'alert-' + Date.now();
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.role = 'alert';
        alert.innerHTML = `
          <div class="d-flex align-items-center">
            <i class="fas fa-check-circle me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="إغلاق"></button>
          </div>
        `;
        alertContainer.prepend(alert);
        
        // إضافة تأثير ظهور
        setTimeout(() => alert.classList.add('show'), 10);
        
        // إخفاء تلقائي بعد المدة المحددة
        if (autoHide) {
          setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
          }, duration);
        }
      }
    }
  },
  
  // عرض رسالة خطأ مع تأثيرات
  showError(message, options = {}) {
    const { autoHide = true, duration = 5000 } = options;
    
    if (typeof toastr !== 'undefined') {
      toastr.error(message, 'خطأ', { 
        timeOut: autoHide ? duration : 0,
        extendedTimeOut: 1000,
        closeButton: !autoHide,
        progressBar: true,
        positionClass: 'toast-top-left',
        rtl: true
      });
    } else {
      const alertContainer = document.getElementById('alertsContainer');
      if (alertContainer) {
        const alertId = 'alert-' + Date.now();
        const alert = document.createElement('div');
        alert.id = alertId;
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.role = 'alert';
        alert.innerHTML = `
          <div class="d-flex align-items-center">
            <i class="fas fa-exclamation-circle me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="إغلاق"></button>
          </div>
        `;
        alertContainer.prepend(alert);
        
        // إضافة تأثير ظهور
        setTimeout(() => alert.classList.add('show'), 10);
        
        // إخفاء تلقائي بعد المدة المحددة
        if (autoHide) {
          setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 300);
          }, duration);
        }
      }
    }
  },
  
  // عرض/إخفاء مؤشر التحميل
  showLoading(show) {
    const loadingElement = document.getElementById('loadingOverlay');
    if (loadingElement) {
      loadingElement.style.display = show ? 'flex' : 'none';
    }
  }
};

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  POSDashboard.init();
});
