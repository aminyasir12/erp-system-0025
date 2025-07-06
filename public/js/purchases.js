/**
 * نظام إدارة المشتريات
 * يتضمن وظائف إدارة أوامر الشراء، عرض المشتريات، وإدارة عمليات الشراء
 */

class PurchasesManager {
  constructor() {
    this.apiUrl = '/api/v1/purchases';
    this.suppliersUrl = '/api/v1/suppliers';
    this.productsUrl = '/api/v1/products';
    this.purchaseItems = [];
    this.suppliers = [];
    this.products = [];
    this.currentPurchase = null;
    this.purchases = []; // لتخزين بيانات المشتريات
    
    this.initEventListeners();
    this.loadInitialData();
  }

  /**
   * تهيئة مستمعي الأحداث
   */
  initEventListeners() {
    // زر إنشاء أمر شراء جديد
    const newPurchaseBtn = document.getElementById('newPurchaseBtn');
    if (newPurchaseBtn) {
      newPurchaseBtn.addEventListener('click', () => this.showNewPurchaseForm());
    }

    // نموذج إنشاء أمر شراء
    const purchaseForm = document.getElementById('purchaseForm');
    if (purchaseForm) {
      purchaseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.savePurchase();
      });
    }

    // زر إضافة منتج لأمر الشراء
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.addProductToPurchase());
    }

    // البحث في جدول المشتريات
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        this.filterPurchases(e.target.value);
      });
    }

    // تصفية المشتريات حسب التاريخ
    const dateFilterBtn = document.getElementById('dateFilterBtn');
    if (dateFilterBtn) {
      dateFilterBtn.addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        this.filterPurchasesByDate(startDate, endDate);
      });
    }

    // تصفية المشتريات حسب الحالة
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterPurchasesByStatus(e.target.value);
      });
    }
  }

  /**
   * تحميل البيانات الأولية (الموردين والمنتجات)
   */
  async loadInitialData() {
    try {
      // استخدام البيانات من الكائن الرئيسي للتطبيق
      if (window.app) {
        this.suppliers = window.app.suppliers || [];
        this.products = window.app.products || [];
      } else {
        // للتطوير فقط: استخدام بيانات وهمية إذا لم يكن الكائن الرئيسي متاحًا
        this.suppliers = [
          { id: 1, name: 'شركة الإلكترونيات الحديثة', phone: '0123456789', email: 'info@modern-electronics.com' },
          { id: 2, name: 'مؤسسة التقنية المتطورة', phone: '0123456788', email: 'info@advanced-tech.com' },
          { id: 3, name: 'شركة الأجهزة الذكية', phone: '0123456787', email: 'info@smart-devices.com' }
        ];
        
        this.products = [
          { id: 1, name: 'لابتوب HP', barcode: '123456', price: 4500, cost: 3800, unit: 'قطعة' },
          { id: 2, name: 'طابعة Canon', barcode: '123457', price: 1800, cost: 1500, unit: 'قطعة' },
          { id: 3, name: 'ماوس لوجيتك', barcode: '123458', price: 180, cost: 120, unit: 'قطعة' }
        ];
      }
      
      this.populateSupplierSelect();
      this.populateProductSelect();
      this.loadPurchases();
      
      // في المستقبل، استبدل هذا بطلبات API حقيقية
      /*
      const [suppliersResponse, productsResponse] = await Promise.all([
        fetch(this.suppliersUrl),
        fetch(this.productsUrl)
      ]);
      
      if (suppliersResponse.ok && productsResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        const productsData = await productsResponse.json();
        
        this.suppliers = suppliersData.data.suppliers;
        this.products = productsData.data.products;
        
        this.populateSupplierSelect();
        this.populateProductSelect();
        this.loadPurchases();
      }
      */
    } catch (error) {
      console.error('خطأ في تحميل البيانات الأولية:', error);
      if (window.app) {
        window.app.showNotification('حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة.', 'error');
      } else {
        alert('حدث خطأ أثناء تحميل البيانات. يرجى تحديث الصفحة.');
      }
    }
  }

  /**
   * تعبئة قائمة الموردين
   */
  populateSupplierSelect() {
    const supplierSelect = document.getElementById('supplierSelect');
    if (!supplierSelect) return;
    
    supplierSelect.innerHTML = '<option value="">اختر المورد...</option>';
    
    this.suppliers.forEach(supplier => {
      const option = document.createElement('option');
      option.value = supplier.id;
      option.textContent = `${supplier.name} - ${supplier.phone}`;
      supplierSelect.appendChild(option);
    });
  }

  /**
   * تعبئة قائمة المنتجات
   */
  populateProductSelect() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    productSelect.innerHTML = '<option value="">اختر المنتج...</option>';
    
    this.products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = `${product.name}`;
      option.dataset.price = product.price;
      option.dataset.unit = product.unit;
      productSelect.appendChild(option);
    });
  }

  /**
   * تحميل قائمة المشتريات
   */
  async loadPurchases() {
    try {
      // للتطوير فقط: استخدام بيانات وهمية
      this.purchases = [
        { 
          id: 1, 
          invoiceNumber: 'PO-001', 
          purchaseDate: '2023-01-10',
          dueDate: '2023-01-20',
          supplier: { id: 1, name: 'شركة الأمل للتجارة' }, 
          total: 9000,
          subtotal: 7826,
          tax: 1174,
          status: 'received',
          paidAmount: 9000,
          balance: 0,
          notes: 'تم استلام البضاعة بالكامل',
          items: [
            { productId: 1, productName: 'لابتوب HP ProBook', quantity: 2, unitPrice: 2800, unit: 'قطعة', total: 5600 },
            { productId: 2, productName: 'طابعة Canon MF3010', quantity: 3, unitPrice: 750, unit: 'قطعة', total: 2250 }
          ]
        },
        { 
          id: 2, 
          invoiceNumber: 'PO-002', 
          purchaseDate: '2023-01-15',
          dueDate: '2023-01-30',
          supplier: { id: 2, name: 'مؤسسة النور' }, 
          total: 5400,
          subtotal: 4696,
          tax: 704,
          status: 'ordered',
          paidAmount: 2700,
          balance: 2700,
          notes: 'تم دفع 50% كدفعة مقدمة',
          items: [
            { productId: 3, productName: 'جوال سامسونج جالكسي S21', quantity: 1, unitPrice: 2600, unit: 'قطعة', total: 2600 },
            { productId: 7, productName: 'سماعات بلوتوث', quantity: 15, unitPrice: 140, unit: 'قطعة', total: 2100 }
          ]
        },
        { 
          id: 3, 
          invoiceNumber: 'PO-003', 
          purchaseDate: '2023-01-20',
          dueDate: '2023-02-05',
          supplier: { id: 3, name: 'شركة الوطن للتوريدات' }, 
          total: 3600,
          subtotal: 3130,
          tax: 470,
          status: 'draft',
          paidAmount: 0,
          balance: 3600,
          notes: 'بانتظار الموافقة النهائية',
          items: [
            { productId: 4, productName: 'شاشة LG 24 بوصة', quantity: 5, unitPrice: 550, unit: 'قطعة', total: 2750 },
            { productId: 10, productName: 'كيبل HDMI', quantity: 15, unitPrice: 25, unit: 'قطعة', total: 375 }
          ]
        },
        { 
          id: 4, 
          invoiceNumber: 'PO-004', 
          purchaseDate: '2023-02-01',
          dueDate: '2023-02-15',
          supplier: { id: 4, name: 'مؤسسة الخليج' }, 
          total: 2875,
          subtotal: 2500,
          tax: 375,
          status: 'ordered',
          paidAmount: 2875,
          balance: 0,
          notes: 'تم الدفع بالكامل، بانتظار الاستلام',
          items: [
            { productId: 5, productName: 'لوحة مفاتيح لاسلكية', quantity: 20, unitPrice: 75, unit: 'قطعة', total: 1500 },
            { productId: 6, productName: 'ماوس لاسلكي', quantity: 25, unitPrice: 45, unit: 'قطعة', total: 1125 }
          ]
        },
        { 
          id: 5, 
          invoiceNumber: 'PO-005', 
          purchaseDate: '2023-02-10',
          dueDate: '2023-02-25',
          supplier: { id: 5, name: 'شركة المستقبل' }, 
          total: 4600,
          subtotal: 4000,
          tax: 600,
          status: 'cancelled',
          paidAmount: 0,
          balance: 0,
          notes: 'تم إلغاء الطلب بسبب عدم توفر المنتجات',
          items: [
            { productId: 8, productName: 'حبر طابعة أسود', quantity: 20, unitPrice: 120, unit: 'قطعة', total: 2400 },
            { productId: 9, productName: 'حبر طابعة ملون', quantity: 10, unitPrice: 150, unit: 'قطعة', total: 1500 }
          ]
        }
      ];
      
      this.renderPurchasesTable(this.purchases);
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(this.apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        this.purchases = data.data.purchases;
        this.renderPurchasesTable(this.purchases);
      }
      */
    } catch (error) {
      console.error('خطأ في تحميل المشتريات:', error);
      if (window.app) {
        window.app.showNotification('حدث خطأ أثناء تحميل بيانات المشتريات.', 'error');
      } else {
        alert('حدث خطأ أثناء تحميل بيانات المشتريات.');
      }
    }
  }

  /**
   * عرض جدول المشتريات
   */
  renderPurchasesTable(purchases) {
    const tableBody = document.getElementById('purchasesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (purchases.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">لا توجد مشتريات لعرضها</td>
        </tr>
      `;
      return;
    }
    
    purchases.forEach(purchase => {
      const row = document.createElement('tr');
      
      // تحديد لون الصف حسب الحالة
      if (purchase.status === 'cancelled') {
        row.classList.add('cancelled-row');
      }
      
      row.innerHTML = `
        <td>${purchase.invoiceNumber}</td>
        <td>${new Date(purchase.purchaseDate).toLocaleDateString('ar-SA')}</td>
        <td>${purchase.supplier.name}</td>
        <td>${purchase.total.toFixed(2)} ريال</td>
        <td>
          <span class="status-badge status-${purchase.status}">
            ${this.getStatusText(purchase.status)}
          </span>
        </td>
        <td>${purchase.paidAmount.toFixed(2)} / ${purchase.total.toFixed(2)} ريال</td>
        <td>
          <div class="actions">
            <button class="btn-view" data-id="${purchase.id}" title="عرض التفاصيل">
              <i class="fas fa-eye"></i>
            </button>
            ${purchase.status === 'draft' ? `
              <button class="btn-edit" data-id="${purchase.id}" title="تعديل">
                <i class="fas fa-edit"></i>
              </button>
            ` : ''}
            ${purchase.status === 'ordered' ? `
              <button class="btn-receive" data-id="${purchase.id}" title="استلام البضاعة">
                <i class="fas fa-truck-loading"></i>
              </button>
            ` : ''}
            ${purchase.status === 'draft' ? `
              <button class="btn-cancel" data-id="${purchase.id}" title="إلغاء">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
          </div>
        </td>
      `;
      
      // إضافة مستمعي الأحداث للأزرار
      tableBody.appendChild(row);
      
      // زر عرض التفاصيل
      const viewBtn = row.querySelector('.btn-view');
      viewBtn.addEventListener('click', () => this.viewPurchaseDetails(purchase.id));
      
      // زر تعديل أمر الشراء
      const editBtn = row.querySelector('.btn-edit');
      if (editBtn) {
        editBtn.addEventListener('click', () => this.editPurchase(purchase.id));
      }
      
      // زر استلام البضاعة
      const receiveBtn = row.querySelector('.btn-receive');
      if (receiveBtn) {
        receiveBtn.addEventListener('click', () => this.receivePurchase(purchase.id));
      }
      
      // زر إلغاء أمر الشراء
      const cancelBtn = row.querySelector('.btn-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.cancelPurchase(purchase.id));
      }
    });
  }

  /**
   * الحصول على نص حالة أمر الشراء
   */
  getStatusText(status) {
    const statusMap = {
      'draft': 'مسودة',
      'ordered': 'تم الطلب',
      'received': 'تم الاستلام',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  }

  /**
   * عرض نموذج إنشاء أمر شراء جديد
   */
  showNewPurchaseForm() {
    // إعادة تعيين النموذج
    const purchaseForm = document.getElementById('purchaseForm');
    if (purchaseForm) {
      purchaseForm.reset();
    }
    
    // إعادة تعيين قائمة المنتجات
    this.purchaseItems = [];
    this.updatePurchaseItemsTable();
    
    // إظهار النموذج
    const purchaseModal = document.getElementById('purchaseModal');
    if (purchaseModal) {
      if (window.app) {
        window.app.openModal(purchaseModal, 'lg');
      } else {
        purchaseModal.style.display = 'block';
        purchaseModal.classList.add('show');
      }
    }
  }

  /**
   * إضافة منتج إلى أمر الشراء
   */
  addProductToPurchase() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');
    const priceInput = document.getElementById('priceInput');
    
    if (!productSelect || !quantityInput || !priceInput) return;
    
    const productId = productSelect.value;
    const quantity = parseInt(quantityInput.value);
    const price = parseFloat(priceInput.value);
    
    if (!productId || isNaN(quantity) || quantity <= 0 || isNaN(price) || price <= 0) {
      this.showMessage('يرجى اختيار منتج وإدخال كمية وسعر صحيح', 'error');
      return;
    }
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const unit = selectedOption.dataset.unit;
    const productName = selectedOption.textContent;
    
    // التحقق من وجود المنتج في القائمة
    const existingItemIndex = this.purchaseItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      // تحديث الكمية والسعر إذا كان المنتج موجوداً
      this.purchaseItems[existingItemIndex].quantity += quantity;
      this.purchaseItems[existingItemIndex].unitPrice = price;
      this.purchaseItems[existingItemIndex].total = this.purchaseItems[existingItemIndex].quantity * price;
    } else {
      // إضافة منتج جديد
      this.purchaseItems.push({
        productId,
        productName,
        quantity,
        unitPrice: price,
        unit,
        total: quantity * price
      });
    }
    
    // تحديث جدول المنتجات
    this.updatePurchaseItemsTable();
    
    // إعادة تعيين حقول الإدخال
    productSelect.value = '';
    quantityInput.value = '1';
    priceInput.value = '';
  }

  /**
   * تحديث جدول منتجات أمر الشراء
   */
  updatePurchaseItemsTable() {
    const tableBody = document.getElementById('purchaseItemsBody');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (!tableBody || !subtotalElement || !taxElement || !totalElement) return;
    
    tableBody.innerHTML = '';
    
    if (this.purchaseItems.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">لم يتم إضافة منتجات بعد</td>
        </tr>
      `;
      
      subtotalElement.textContent = '0.00 ريال';
      taxElement.textContent = '0.00 ريال';
      totalElement.textContent = '0.00 ريال';
      return;
    }
    
    let subtotal = 0;
    
    this.purchaseItems.forEach((item, index) => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>${item.unitPrice.toFixed(2)} ريال</td>
        <td>${item.total.toFixed(2)} ريال</td>
        <td>
          <button class="btn-remove" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
      
      // زر حذف المنتج
      const removeBtn = row.querySelector('.btn-remove');
      removeBtn.addEventListener('click', () => {
        this.purchaseItems.splice(index, 1);
        this.updatePurchaseItemsTable();
      });
      
      subtotal += item.total;
    });
    
    // حساب الضريبة والإجمالي
    const taxRate = 0.15; // 15% ضريبة القيمة المضافة
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    subtotalElement.textContent = `${subtotal.toFixed(2)} ريال`;
    taxElement.textContent = `${taxAmount.toFixed(2)} ريال`;
    totalElement.textContent = `${total.toFixed(2)} ريال`;
  }

  /**
   * حفظ أمر الشراء
   */
  async savePurchase() {
    const supplierSelect = document.getElementById('supplierSelect');
    const dueDateInput = document.getElementById('dueDateInput');
    const notesInput = document.getElementById('notesInput');
    
    if (!supplierSelect) return;
    
    if (this.purchaseItems.length === 0) {
      this.showMessage('يرجى إضافة منتج واحد على الأقل لأمر الشراء', 'error');
      return;
    }
    
    const supplierId = supplierSelect.value;
    
    if (!supplierId) {
      this.showMessage('يرجى اختيار المورد', 'error');
      return;
    }
    
    const dueDate = dueDateInput ? dueDateInput.value : null;
    const notes = notesInput ? notesInput.value : '';
    
    // حساب الإجمالي والضريبة
    let subtotal = 0;
    this.purchaseItems.forEach(item => {
      subtotal += item.total;
    });
    
    const taxRate = 0.15;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    const purchaseData = {
      supplierId,
      dueDate,
      items: this.purchaseItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: taxRate,
        taxAmount: item.total * taxRate,
        total: item.total + (item.total * taxRate)
      })),
      notes,
      subtotal,
      taxAmount,
      total,
      status: 'draft'
    };
    
    try {
      // للتطوير فقط: محاكاة حفظ أمر الشراء
      console.log('بيانات أمر الشراء المرسلة:', purchaseData);
      
      // إغلاق النموذج
      const purchaseModal = document.getElementById('purchaseModal');
      if (purchaseModal) {
        purchaseModal.style.display = 'none';
      }
      
      this.showMessage('تم إنشاء أمر الشراء بنجاح', 'success');
      
      // إعادة تحميل قائمة المشتريات
      this.loadPurchases();
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(purchaseData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // إغلاق النموذج
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal) {
          purchaseModal.style.display = 'none';
        }
        
        this.showMessage('تم إنشاء أمر الشراء بنجاح', 'success');
        
        // إعادة تحميل قائمة المشتريات
        this.loadPurchases();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء حفظ أمر الشراء');
      }
      */
    } catch (error) {
      console.error('خطأ في حفظ أمر الشراء:', error);
      this.showMessage(`حدث خطأ أثناء حفظ أمر الشراء: ${error.message}`, 'error');
    }
  }

  /**
   * عرض تفاصيل أمر الشراء
   */
  async viewPurchaseDetails(purchaseId) {
    try {
      // البحث عن أمر الشراء في البيانات المحملة مسبقًا
      const purchase = this.purchases.find(p => p.id === purchaseId);
      
      if (purchase) {
        // تحويل بيانات أمر الشراء إلى الصيغة المطلوبة لعرضها
        const formattedPurchase = {
          id: purchase.id,
          invoiceNumber: purchase.invoiceNumber,
          purchaseDate: purchase.purchaseDate,
          dueDate: purchase.dueDate,
          supplier: purchase.supplier,
          items: purchase.items.map(item => ({
            product: { name: item.productName },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxAmount: item.unitPrice * item.quantity * 0.15, // افتراض ضريبة 15%
            total: item.total * 1.15 // إضافة الضريبة للإجمالي
          })),
          subtotal: purchase.subtotal,
          taxAmount: purchase.tax,
          total: purchase.total,
          status: purchase.status,
          paidAmount: purchase.paidAmount,
          balance: purchase.balance,
          notes: purchase.notes || ''
        };
        
        this.showPurchaseDetailsModal(formattedPurchase);
      } else {
        throw new Error('لم يتم العثور على أمر الشراء');
      }
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${purchaseId}`);
      
      if (response.ok) {
        const data = await response.json();
        this.showPurchaseDetailsModal(data.data.purchase);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء جلب تفاصيل أمر الشراء');
      }
      */
    } catch (error) {
      console.error('خطأ في عرض تفاصيل أمر الشراء:', error);
      if (window.app) {
        window.app.showNotification(`حدث خطأ أثناء عرض تفاصيل أمر الشراء: ${error.message}`, 'error');
      } else {
        alert(`حدث خطأ أثناء عرض تفاصيل أمر الشراء: ${error.message}`);
      }
    }
  }

  /**
   * عرض نافذة تفاصيل أمر الشراء
   */
  showPurchaseDetailsModal(purchase) {
    const detailsModal = document.getElementById('purchaseDetailsModal');
    if (!detailsModal) return;
    
    // تعبئة بيانات أمر الشراء
    document.getElementById('detailsInvoiceNumber').textContent = purchase.invoiceNumber;
    
    // تنسيق التاريخ باستخدام دالة التنسيق من الكائن الرئيسي إذا كانت متاحة
    if (window.app && window.app.formatDate) {
      document.getElementById('detailsDate').textContent = window.app.formatDate(purchase.purchaseDate);
      document.getElementById('detailsDueDate').textContent = purchase.dueDate ? window.app.formatDate(purchase.dueDate) : 'غير محدد';
    } else {
      document.getElementById('detailsDate').textContent = new Date(purchase.purchaseDate).toLocaleDateString('ar-SA');
      document.getElementById('detailsDueDate').textContent = purchase.dueDate ? new Date(purchase.dueDate).toLocaleDateString('ar-SA') : 'غير محدد';
    }
    
    document.getElementById('detailsSupplier').textContent = purchase.supplier.name;
    document.getElementById('detailsStatus').textContent = this.getStatusText(purchase.status);
    
    // تنسيق المبالغ باستخدام دالة التنسيق من الكائن الرئيسي إذا كانت متاحة
    if (window.app && window.app.formatCurrency) {
      document.getElementById('detailsPaidAmount').textContent = window.app.formatCurrency(purchase.paidAmount);
      document.getElementById('detailsBalance').textContent = window.app.formatCurrency(purchase.balance);
    } else {
      document.getElementById('detailsPaidAmount').textContent = `${purchase.paidAmount.toFixed(2)} ريال`;
      document.getElementById('detailsBalance').textContent = `${purchase.balance.toFixed(2)} ريال`;
    }
    
    document.getElementById('detailsNotes').textContent = purchase.notes || 'لا توجد ملاحظات';
    
    // تعبئة جدول المنتجات
    const itemsTableBody = document.getElementById('detailsItemsBody');
    itemsTableBody.innerHTML = '';
    
    purchase.items.forEach(item => {
      const row = document.createElement('tr');
      
      // تنسيق المبالغ باستخدام دالة التنسيق من الكائن الرئيسي إذا كانت متاحة
      let unitPriceFormatted, taxAmountFormatted, totalFormatted;
      
      if (window.app && window.app.formatCurrency) {
        unitPriceFormatted = window.app.formatCurrency(item.unitPrice);
        taxAmountFormatted = window.app.formatCurrency(item.taxAmount);
        totalFormatted = window.app.formatCurrency(item.total);
      } else {
        unitPriceFormatted = `${item.unitPrice.toFixed(2)} ريال`;
        taxAmountFormatted = `${item.taxAmount.toFixed(2)} ريال`;
        totalFormatted = `${item.total.toFixed(2)} ريال`;
      }
      
      row.innerHTML = `
        <td>${item.product.name}</td>
        <td>${item.quantity}</td>
        <td>${unitPriceFormatted}</td>
        <td>${taxAmountFormatted}</td>
        <td>${totalFormatted}</td>
      `;
      
      itemsTableBody.appendChild(row);
    });
    
    // تعبئة المجاميع
    if (window.app && window.app.formatCurrency) {
      document.getElementById('detailsSubtotal').textContent = window.app.formatCurrency(purchase.subtotal);
      document.getElementById('detailsTax').textContent = window.app.formatCurrency(purchase.taxAmount);
      document.getElementById('detailsTotal').textContent = window.app.formatCurrency(purchase.total);
    } else {
      document.getElementById('detailsSubtotal').textContent = `${purchase.subtotal.toFixed(2)} ريال`;
      document.getElementById('detailsTax').textContent = `${purchase.taxAmount.toFixed(2)} ريال`;
      document.getElementById('detailsTotal').textContent = `${purchase.total.toFixed(2)} ريال`;
    }
    
    // إظهار النافذة
    if (window.app) {
      window.app.openModal(detailsModal);
    } else {
      detailsModal.style.display = 'block';
    }
    
    // زر تحديث حالة الدفع
    const updatePaymentBtn = document.getElementById('updatePaymentBtn');
    if (updatePaymentBtn) {
      // إزالة مستمعي الأحداث السابقة
      const newUpdatePaymentBtn = updatePaymentBtn.cloneNode(true);
      updatePaymentBtn.parentNode.replaceChild(newUpdatePaymentBtn, updatePaymentBtn);
      
      if (purchase.balance > 0) {
        newUpdatePaymentBtn.style.display = 'inline-block';
        newUpdatePaymentBtn.addEventListener('click', () => this.updatePaymentStatus(purchase.id));
      } else {
        newUpdatePaymentBtn.style.display = 'none';
      }
    }
    
    // زر تأكيد الطلب
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');
    if (confirmOrderBtn) {
      // إزالة مستمعي الأحداث السابقة
      const newConfirmOrderBtn = confirmOrderBtn.cloneNode(true);
      confirmOrderBtn.parentNode.replaceChild(newConfirmOrderBtn, confirmOrderBtn);
      
      if (purchase.status === 'draft') {
        newConfirmOrderBtn.style.display = 'inline-block';
        newConfirmOrderBtn.addEventListener('click', () => this.confirmOrder(purchase.id));
      } else {
        newConfirmOrderBtn.style.display = 'none';
      }
    }
    
    // زر استلام البضاعة
    const receiveItemsBtn = document.getElementById('receiveItemsBtn');
    if (receiveItemsBtn) {
      // إزالة مستمعي الأحداث السابقة
      const newReceiveItemsBtn = receiveItemsBtn.cloneNode(true);
      receiveItemsBtn.parentNode.replaceChild(newReceiveItemsBtn, receiveItemsBtn);
      
      if (purchase.status === 'ordered') {
        newReceiveItemsBtn.style.display = 'inline-block';
        newReceiveItemsBtn.addEventListener('click', () => this.receivePurchase(purchase.id));
      } else {
        newReceiveItemsBtn.style.display = 'none';
      }
    }
  }

  /**
   * تحديث حالة الدفع
   */
  async updatePaymentStatus(purchaseId) {
    try {
      // للتطوير فقط: محاكاة تحديث حالة الدفع
      console.log(`تحديث حالة الدفع لأمر الشراء ${purchaseId}`);
      
      this.showMessage('تم تحديث حالة الدفع بنجاح', 'success');
      
      // إغلاق نافذة التفاصيل
      const detailsModal = document.getElementById('purchaseDetailsModal');
      if (detailsModal) {
        detailsModal.style.display = 'none';
      }
      
      // إعادة تحميل قائمة المشتريات
      this.loadPurchases();
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${purchaseId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paidAmount: 1000 // مثال: دفع 1000 ريال
        })
      });
      
      if (response.ok) {
        this.showMessage('تم تحديث حالة الدفع بنجاح', 'success');
        
        // إغلاق نافذة التفاصيل
        const detailsModal = document.getElementById('purchaseDetailsModal');
        if (detailsModal) {
          detailsModal.style.display = 'none';
        }
        
        // إعادة تحميل قائمة المشتريات
        this.loadPurchases();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء تحديث حالة الدفع');
      }
      */
    } catch (error) {
      console.error('خطأ في تحديث حالة الدفع:', error);
      this.showMessage(`حدث خطأ أثناء تحديث حالة الدفع: ${error.message}`, 'error');
    }
  }

  /**
   * تأكيد أمر الشراء
   */
  async confirmOrder(purchaseId) {
    // استخدام مربع حوار التأكيد من الكائن الرئيسي إذا كان متاحًا
    let confirmed = false;
    if (window.app && window.app.showConfirmDialog) {
      confirmed = await window.app.showConfirmDialog('هل أنت متأكد من تأكيد أمر الشراء؟');
    } else {
      confirmed = confirm('هل أنت متأكد من تأكيد أمر الشراء؟');
    }
    
    if (!confirmed) {
      return;
    }
    
    try {
      console.log(`تأكيد أمر الشراء ${purchaseId}`);
      
      // للتطوير فقط: تحديث حالة أمر الشراء محليًا
      const purchaseIndex = this.purchases.findIndex(p => p.id === purchaseId);
      if (purchaseIndex !== -1) {
        this.purchases[purchaseIndex].status = 'ordered';
        this.renderPurchasesTable(this.purchases);
        
        // إغلاق نافذة التفاصيل إذا كانت مفتوحة
        const detailsModal = document.getElementById('purchaseDetailsModal');
        if (detailsModal && detailsModal.style.display === 'block') {
          if (window.app) {
            window.app.closeModal(detailsModal);
          } else {
            detailsModal.style.display = 'none';
          }
        }
        
        this.showMessage('تم تأكيد أمر الشراء بنجاح', 'success');
      } else {
        throw new Error('لم يتم العثور على أمر الشراء');
      }
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${purchaseId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'development-token'}`
        }
      });
      
      if (response.ok) {
        this.showMessage('تم تأكيد أمر الشراء بنجاح', 'success');
        
        // إعادة تحميل قائمة المشتريات
        this.loadPurchases();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء تأكيد أمر الشراء');
      }
      */
    } catch (error) {
      console.error('خطأ في تأكيد أمر الشراء:', error);
      this.showMessage(`حدث خطأ أثناء تأكيد أمر الشراء: ${error.message}`, 'error');
    }
  }

  /**
   * استلام البضاعة
   */
  async receivePurchase(purchaseId) {
    // استخدام مربع حوار التأكيد من الكائن الرئيسي إذا كان متاحًا
    let confirmed = false;
    if (window.app && window.app.showConfirmDialog) {
      confirmed = await window.app.showConfirmDialog('هل أنت متأكد من استلام البضاعة؟');
    } else {
      confirmed = confirm('هل أنت متأكد من استلام البضاعة؟');
    }
    
    if (!confirmed) {
      return;
    }
    
    try {
      console.log(`استلام البضاعة لأمر الشراء ${purchaseId}`);
      
      // للتطوير فقط: تحديث حالة أمر الشراء محليًا
      const purchaseIndex = this.purchases.findIndex(p => p.id === purchaseId);
      if (purchaseIndex !== -1) {
        this.purchases[purchaseIndex].status = 'received';
        this.renderPurchasesTable(this.purchases);
        
        // إغلاق نافذة التفاصيل إذا كانت مفتوحة
        const detailsModal = document.getElementById('purchaseDetailsModal');
        if (detailsModal && detailsModal.style.display === 'block') {
          if (window.app) {
            window.app.closeModal(detailsModal);
          } else {
            detailsModal.style.display = 'none';
          }
        }
        
        this.showMessage('تم تسجيل استلام البضاعة بنجاح', 'success');
      } else {
        throw new Error('لم يتم العثور على أمر الشراء');
      }
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${purchaseId}/receive`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'development-token'}`
        }
      });
      
      if (response.ok) {
        this.showMessage('تم تسجيل استلام البضاعة بنجاح', 'success');
        
        // إعادة تحميل قائمة المشتريات
        this.loadPurchases();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء تسجيل استلام البضاعة');
      }
      */
    } catch (error) {
      console.error('خطأ في استلام البضاعة:', error);
      this.showMessage(`حدث خطأ أثناء استلام البضاعة: ${error.message}`, 'error');
    }
  }

  /**
   * تعديل أمر الشراء
   */
  async editPurchase(purchaseId) {
    try {
      // للتطوير فقط: محاكاة تحميل بيانات أمر الشراء للتعديل
      console.log(`تحميل بيانات أمر الشراء ${purchaseId} للتعديل`);
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${purchaseId}`);
      
      if (response.ok) {
        const data = await response.json();
        const purchase = data.data.purchase;
        
        // تعبئة نموذج التعديل
        // ...
        
        // إظهار النموذج
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal) {
          purchaseModal.style.display = 'block';
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء تحميل بيانات أمر الشراء');
      }
      */
    } catch (error) {
      console.error('خطأ في تحميل بيانات أمر الشراء للتعديل:', error);
      this.showMessage(`حدث خطأ أثناء تحميل بيانات أمر الشراء: ${error.message}`, 'error');
    }
  }

  /**
   * إلغاء أمر الشراء
   */
  async cancelPurchase(purchaseId) {
    // استخدام مربع حوار التأكيد من الكائن الرئيسي إذا كان متاحًا
    let confirmed = false;
    if (window.app && window.app.showConfirmDialog) {
      confirmed = await window.app.showConfirmDialog('هل أنت متأكد من إلغاء أمر الشراء؟');
    } else {
      confirmed = confirm('هل أنت متأكد من إلغاء أمر الشراء؟');
    }
    
    if (!confirmed) {
      return;
    }
    
    try {
      console.log(`إلغاء أمر الشراء ${purchaseId}`);
      
      // للتطوير فقط: تحديث حالة أمر الشراء محليًا
      const purchaseIndex = this.purchases.findIndex(p => p.id === purchaseId);
      if (purchaseIndex !== -1) {
        this.purchases[purchaseIndex].status = 'cancelled';
        this.renderPurchasesTable(this.purchases);
        
        // إغلاق نافذة التفاصيل إذا كانت مفتوحة
        const detailsModal = document.getElementById('purchaseDetailsModal');
        if (detailsModal && detailsModal.style.display === 'block') {
          if (window.app) {
            window.app.closeModal(detailsModal);
          } else {
            detailsModal.style.display = 'none';
          }
        }
        
        this.showMessage('تم إلغاء أمر الشراء بنجاح', 'success');
      } else {
        throw new Error('لم يتم العثور على أمر الشراء');
      }
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${purchaseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'development-token'}`
        }
      });
      
      if (response.ok) {
        this.showMessage('تم إلغاء أمر الشراء بنجاح', 'success');
        
        // إعادة تحميل قائمة المشتريات
        this.loadPurchases();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء إلغاء أمر الشراء');
      }
      */
    } catch (error) {
      console.error('خطأ في إلغاء أمر الشراء:', error);
      this.showMessage(`حدث خطأ أثناء إلغاء أمر الشراء: ${error.message}`, 'error');
    }
  }

  /**
   * تصفية المشتريات حسب النص
   */
  filterPurchases(searchText) {
    // للتطوير: تنفيذ وظيفة البحث
    console.log(`البحث عن: ${searchText}`);
  }

  /**
   * تصفية المشتريات حسب التاريخ
   */
  filterPurchasesByDate(startDate, endDate) {
    // للتطوير: تنفيذ وظيفة التصفية حسب التاريخ
    console.log(`تصفية من ${startDate} إلى ${endDate}`);
  }

  /**
   * تصفية المشتريات حسب الحالة
   */
  filterPurchasesByStatus(status) {
    // للتطوير: تنفيذ وظيفة التصفية حسب الحالة
    console.log(`تصفية حسب الحالة: ${status}`);
  }

  /**
   * عرض رسالة للمستخدم
   */
  showMessage(message, type = 'success') {
    // استخدام دالة عرض الإشعارات من الكائن الرئيسي إذا كانت متاحة
    if (window.app && window.app.showNotification) {
      window.app.showNotification(message, type);
    } else {
      // استخدام طريقة العرض البديلة
      const messageDiv = document.createElement('div');
      messageDiv.className = `alert alert-${type} fade-in`;
      messageDiv.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
      `;
      
      const container = document.querySelector('.content') || document.body;
      container.insertBefore(messageDiv, container.firstChild);
      
      // إزالة الرسالة بعد 5 ثواني
      setTimeout(() => {
        messageDiv.classList.add('fade-out');
        setTimeout(() => messageDiv.remove(), 300);
      }, 5000);
    }
  }
}

// تهيئة مدير المشتريات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.purchasesManager = new PurchasesManager();
});