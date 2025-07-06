/**
 * نظام إدارة المبيعات
 * يتضمن وظائف إدارة فواتير البيع، عرض المبيعات، وإدارة عمليات البيع
 */

class SalesManager {
  constructor() {
    this.apiUrl = '/api/v1/sales';
    this.customersUrl = '/api/v1/customers';
    this.productsUrl = '/api/v1/products';
    this.invoiceItems = [];
    this.customers = [];
    this.products = [];
    this.currentInvoice = null;
    this.sales = []; // لتخزين بيانات المبيعات
    
    this.initEventListeners();
    this.loadInitialData();
  }

  /**
   * تهيئة مستمعي الأحداث
   */
  initEventListeners() {
    // زر إنشاء فاتورة جديدة
    const newInvoiceBtn = document.getElementById('newInvoiceBtn');
    if (newInvoiceBtn) {
      newInvoiceBtn.addEventListener('click', () => this.showNewInvoiceForm());
    }

    // نموذج إنشاء فاتورة
    const invoiceForm = document.getElementById('invoiceForm');
    if (invoiceForm) {
      invoiceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveInvoice();
      });
    }

    // زر إضافة منتج للفاتورة
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => this.addProductToInvoice());
    }

    // البحث في جدول المبيعات
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        this.filterSales(e.target.value);
      });
    }

    // تصفية المبيعات حسب التاريخ
    const dateFilterBtn = document.getElementById('dateFilterBtn');
    if (dateFilterBtn) {
      dateFilterBtn.addEventListener('click', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        this.filterSalesByDate(startDate, endDate);
      });
    }

    // تصفية المبيعات حسب الحالة
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterSalesByStatus(e.target.value);
      });
    }
  }

  /**
   * تحميل البيانات الأولية (العملاء والمنتجات)
   */
  async loadInitialData() {
    try {
      // استخدام البيانات من الكائن الرئيسي للتطبيق
      if (window.app) {
        this.customers = window.app.customers || [];
        this.products = window.app.products || [];
      } else {
        // للتطوير فقط: استخدام بيانات وهمية إذا لم يكن الكائن الرئيسي متاحًا
        this.customers = [
          { id: 1, name: 'أحمد محمد', phone: '0123456789', email: 'ahmed@example.com' },
          { id: 2, name: 'سارة أحمد', phone: '0123456788', email: 'sara@example.com' },
          { id: 3, name: 'محمد علي', phone: '0123456787', email: 'mohamed@example.com' }
        ];
        
        this.products = [
          { id: 1, name: 'لابتوب HP', barcode: '123456', price: 5000, stock: 10, unit: 'قطعة' },
          { id: 2, name: 'طابعة Canon', barcode: '123457', price: 2000, stock: 5, unit: 'قطعة' },
          { id: 3, name: 'ماوس لوجيتك', barcode: '123458', price: 200, stock: 20, unit: 'قطعة' }
        ];
      }
      
      this.populateCustomerSelect();
      this.populateProductSelect();
      this.loadSales();
      
      // في المستقبل، استبدل هذا بطلبات API حقيقية
      /*
      const [customersResponse, productsResponse] = await Promise.all([
        fetch(this.customersUrl),
        fetch(this.productsUrl)
      ]);
      
      if (customersResponse.ok && productsResponse.ok) {
        const customersData = await customersResponse.json();
        const productsData = await productsResponse.json();
        
        this.customers = customersData.data.customers;
        this.products = productsData.data.products;
        
        this.populateCustomerSelect();
        this.populateProductSelect();
        this.loadSales();
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
   * تعبئة قائمة العملاء
   */
  populateCustomerSelect() {
    const customerSelect = document.getElementById('customerSelect');
    if (!customerSelect) return;
    
    customerSelect.innerHTML = '<option value="">اختر العميل...</option>';
    
    this.customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id;
      option.textContent = `${customer.name} - ${customer.phone}`;
      customerSelect.appendChild(option);
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
      option.textContent = `${product.name} - ${product.price} ريال`;
      option.dataset.price = product.price;
      option.dataset.stock = product.quantityInStock;
      option.dataset.unit = product.unit;
      productSelect.appendChild(option);
    });
  }

  /**
   * تحميل قائمة المبيعات
   */
  async loadSales() {
    try {
      // للتطوير فقط: استخدام بيانات وهمية
      this.sales = [
        { 
          id: 1, 
          invoiceNumber: 'INV-001', 
          saleDate: '2023-01-15', 
          customer: { id: 1, name: 'أحمد محمد' }, 
          total: 5200, 
          subtotal: 4520,
          tax: 680,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'نقدي',
          notes: 'تم التسليم في نفس اليوم',
          items: [
            { productId: 1, productName: 'لابتوب HP ProBook', quantity: 1, unitPrice: 3500, unit: 'قطعة', total: 3500 },
            { productId: 5, productName: 'لوحة مفاتيح لاسلكية', quantity: 2, unitPrice: 120, unit: 'قطعة', total: 240 },
            { productId: 6, productName: 'ماوس لاسلكي', quantity: 2, unitPrice: 85, unit: 'قطعة', total: 170 },
            { productId: 7, productName: 'سماعات بلوتوث', quantity: 3, unitPrice: 210, unit: 'قطعة', total: 630 }
          ]
        },
        { 
          id: 2, 
          invoiceNumber: 'INV-002', 
          saleDate: '2023-01-20', 
          customer: { id: 2, name: 'سارة أحمد' }, 
          total: 2200, 
          subtotal: 1913,
          tax: 287,
          status: 'completed',
          paymentStatus: 'partial',
          paymentMethod: 'تحويل بنكي',
          notes: 'تم دفع 1000 ريال كدفعة أولى',
          items: [
            { productId: 2, productName: 'طابعة Canon MF3010', quantity: 1, unitPrice: 950, unit: 'قطعة', total: 950 },
            { productId: 8, productName: 'حبر طابعة أسود', quantity: 3, unitPrice: 180, unit: 'قطعة', total: 540 },
            { productId: 9, productName: 'حبر طابعة ملون', quantity: 2, unitPrice: 220, unit: 'قطعة', total: 440 }
          ]
        },
        { 
          id: 3, 
          invoiceNumber: 'INV-003', 
          saleDate: '2023-01-25', 
          customer: { id: 3, name: 'محمد علي' }, 
          total: 400, 
          subtotal: 348,
          tax: 52,
          status: 'cancelled',
          paymentStatus: 'pending',
          paymentMethod: 'آجل',
          notes: 'تم إلغاء الطلب بناءً على طلب العميل',
          items: [
            { productId: 6, productName: 'ماوس لاسلكي', quantity: 2, unitPrice: 85, unit: 'قطعة', total: 170 },
            { productId: 10, productName: 'كيبل HDMI', quantity: 4, unitPrice: 45, unit: 'قطعة', total: 180 }
          ]
        },
        { 
          id: 4, 
          invoiceNumber: 'INV-004', 
          saleDate: '2023-02-05', 
          customer: { id: 4, name: 'فاطمة محمد' }, 
          total: 3680, 
          subtotal: 3200,
          tax: 480,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'بطاقة ائتمان',
          notes: '',
          items: [
            { productId: 3, productName: 'جوال سامسونج جالكسي S21', quantity: 1, unitPrice: 3200, unit: 'قطعة', total: 3200 }
          ]
        },
        { 
          id: 5, 
          invoiceNumber: 'INV-005', 
          saleDate: '2023-02-10', 
          customer: { id: 5, name: 'خالد أحمد' }, 
          total: 1035, 
          subtotal: 900,
          tax: 135,
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'نقدي',
          notes: '',
          items: [
            { productId: 4, productName: 'شاشة LG 24 بوصة', quantity: 1, unitPrice: 750, unit: 'قطعة', total: 750 },
            { productId: 10, productName: 'كيبل HDMI', quantity: 2, unitPrice: 45, unit: 'قطعة', total: 90 },
            { productId: 6, productName: 'ماوس لاسلكي', quantity: 1, unitPrice: 85, unit: 'قطعة', total: 85 }
          ]
        }
      ];
      
      this.renderSalesTable(this.sales);
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(this.apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        this.sales = data.data.sales;
        this.renderSalesTable(this.sales);
      }
      */
    } catch (error) {
      console.error('خطأ في تحميل المبيعات:', error);
      if (window.app) {
        window.app.showNotification('حدث خطأ أثناء تحميل بيانات المبيعات.', 'error');
      } else {
        alert('حدث خطأ أثناء تحميل بيانات المبيعات.');
      }
    }
  }

  /**
   * عرض جدول المبيعات
   */
  renderSalesTable(sales) {
    const tableBody = document.getElementById('salesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (sales.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">لا توجد مبيعات لعرضها</td>
        </tr>
      `;
      return;
    }
    
    sales.forEach(sale => {
      const row = document.createElement('tr');
      
      // تحديد لون الصف حسب الحالة
      if (sale.status === 'cancelled') {
        row.classList.add('cancelled-row');
      }
      
      row.innerHTML = `
        <td>${sale.invoiceNumber}</td>
        <td>${new Date(sale.saleDate).toLocaleDateString('ar-SA')}</td>
        <td>${sale.customer ? sale.customer.name : 'عميل نقدي'}</td>
        <td>${sale.total.toFixed(2)} ريال</td>
        <td>
          <span class="status-badge status-${sale.status}">
            ${this.getStatusText(sale.status)}
          </span>
        </td>
        <td>
          <span class="status-badge payment-${sale.paymentStatus}">
            ${this.getPaymentStatusText(sale.paymentStatus)}
          </span>
        </td>
        <td>
          <div class="actions">
            <button class="btn-view" data-id="${sale.id}" title="عرض التفاصيل">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-print" data-id="${sale.id}" title="طباعة الفاتورة">
              <i class="fas fa-print"></i>
            </button>
            ${sale.status !== 'cancelled' ? `
              <button class="btn-cancel" data-id="${sale.id}" title="إلغاء الفاتورة">
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
      viewBtn.addEventListener('click', () => this.viewInvoiceDetails(sale.id));
      
      // زر طباعة الفاتورة
      const printBtn = row.querySelector('.btn-print');
      printBtn.addEventListener('click', () => this.printInvoice(sale.id));
      
      // زر إلغاء الفاتورة
      const cancelBtn = row.querySelector('.btn-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => this.cancelInvoice(sale.id));
      }
    });
  }

  /**
   * الحصول على نص حالة الفاتورة
   */
  getStatusText(status) {
    const statusMap = {
      'draft': 'مسودة',
      'completed': 'مكتملة',
      'cancelled': 'ملغاة'
    };
    return statusMap[status] || status;
  }

  /**
   * الحصول على نص حالة الدفع
   */
  getPaymentStatusText(paymentStatus) {
    const statusMap = {
      'pending': 'معلق',
      'partial': 'جزئي',
      'paid': 'مدفوع'
    };
    return statusMap[paymentStatus] || paymentStatus;
  }

  /**
   * عرض نموذج إنشاء فاتورة جديدة
   */
  showNewInvoiceForm() {
    // إعادة تعيين النموذج
    const invoiceForm = document.getElementById('invoiceForm');
    if (invoiceForm) {
      invoiceForm.reset();
    }
    
    // إعادة تعيين قائمة المنتجات
    this.invoiceItems = [];
    this.updateInvoiceItemsTable();
    
    // إظهار النموذج
    const invoiceModal = document.getElementById('invoiceModal');
    if (invoiceModal) {
      if (window.app) {
        window.app.openModal(invoiceModal);
      } else {
        invoiceModal.style.display = 'block';
      }
    }
  }

  /**
   * إضافة منتج إلى الفاتورة
   */
  addProductToInvoice() {
    const productSelect = document.getElementById('productSelect');
    const quantityInput = document.getElementById('quantityInput');
    
    if (!productSelect || !quantityInput) return;
    
    const productId = productSelect.value;
    const quantity = parseInt(quantityInput.value);
    
    if (!productId || isNaN(quantity) || quantity <= 0) {
      this.showMessage('يرجى اختيار منتج وإدخال كمية صحيحة', 'error');
      return;
    }
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const price = parseFloat(selectedOption.dataset.price);
    const stock = parseInt(selectedOption.dataset.stock);
    const unit = selectedOption.dataset.unit;
    const productName = selectedOption.textContent.split(' - ')[0];
    
    if (quantity > stock) {
      this.showMessage(`الكمية المطلوبة غير متوفرة. المتاح: ${stock} ${unit}`, 'error');
      return;
    }
    
    // التحقق من وجود المنتج في القائمة
    const existingItemIndex = this.invoiceItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
      // تحديث الكمية إذا كان المنتج موجوداً
      const newQuantity = this.invoiceItems[existingItemIndex].quantity + quantity;
      
      if (newQuantity > stock) {
        this.showMessage(`الكمية الإجمالية تتجاوز المخزون المتاح. المتاح: ${stock} ${unit}`, 'error');
        return;
      }
      
      this.invoiceItems[existingItemIndex].quantity = newQuantity;
      this.invoiceItems[existingItemIndex].total = newQuantity * price;
    } else {
      // إضافة منتج جديد
      this.invoiceItems.push({
        productId,
        productName,
        quantity,
        unitPrice: price,
        unit,
        total: quantity * price
      });
    }
    
    // تحديث جدول المنتجات
    this.updateInvoiceItemsTable();
    
    // إعادة تعيين حقول الإدخال
    productSelect.value = '';
    quantityInput.value = '1';
  }

  /**
   * تحديث جدول منتجات الفاتورة
   */
  updateInvoiceItemsTable() {
    const tableBody = document.getElementById('invoiceItemsBody');
    const subtotalElement = document.getElementById('subtotal');
    const taxElement = document.getElementById('tax');
    const totalElement = document.getElementById('total');
    
    if (!tableBody || !subtotalElement || !taxElement || !totalElement) return;
    
    tableBody.innerHTML = '';
    
    if (this.invoiceItems.length === 0) {
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
    
    this.invoiceItems.forEach((item, index) => {
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
        this.invoiceItems.splice(index, 1);
        this.updateInvoiceItemsTable();
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
   * حفظ الفاتورة
   */
  async saveInvoice() {
    const customerSelect = document.getElementById('customerSelect');
    const paymentMethodSelect = document.getElementById('paymentMethodSelect');
    const notesInput = document.getElementById('notesInput');
    
    if (!customerSelect || !paymentMethodSelect) return;
    
    if (this.invoiceItems.length === 0) {
      this.showMessage('يرجى إضافة منتج واحد على الأقل للفاتورة', 'error');
      return;
    }
    
    const customerId = customerSelect.value;
    const paymentMethod = paymentMethodSelect.value;
    const notes = notesInput ? notesInput.value : '';
    
    // حساب الإجمالي والضريبة
    let subtotal = 0;
    this.invoiceItems.forEach(item => {
      subtotal += item.total;
    });
    
    const taxRate = 0.15;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    const invoiceData = {
      customerId: customerId || null,
      items: this.invoiceItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: taxRate,
        taxAmount: item.total * taxRate,
        total: item.total + (item.total * taxRate)
      })),
      paymentMethod,
      notes,
      subtotal,
      taxAmount,
      total
    };
    
    try {
      // للتطوير فقط: محاكاة حفظ الفاتورة
      console.log('بيانات الفاتورة المرسلة:', invoiceData);
      
      // إغلاق النموذج
      const invoiceModal = document.getElementById('invoiceModal');
      if (invoiceModal) {
        invoiceModal.style.display = 'none';
      }
      
      this.showMessage('تم إنشاء الفاتورة بنجاح', 'success');
      
      // إعادة تحميل قائمة المبيعات
      this.loadSales();
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(invoiceData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // إغلاق النموذج
        const invoiceModal = document.getElementById('invoiceModal');
        if (invoiceModal) {
          invoiceModal.style.display = 'none';
        }
        
        this.showMessage('تم إنشاء الفاتورة بنجاح', 'success');
        
        // إعادة تحميل قائمة المبيعات
        this.loadSales();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء حفظ الفاتورة');
      }
      */
    } catch (error) {
      console.error('خطأ في حفظ الفاتورة:', error);
      this.showMessage(`حدث خطأ أثناء حفظ الفاتورة: ${error.message}`, 'error');
    }
  }

  /**
   * عرض تفاصيل الفاتورة
   */
  async viewInvoiceDetails(invoiceId) {
    try {
      // البحث عن الفاتورة في البيانات المحملة مسبقًا
      const invoice = this.sales.find(sale => sale.id === invoiceId);
      
      if (invoice) {
        // تحويل بيانات الفاتورة إلى الصيغة المطلوبة لعرضها
        const formattedInvoice = {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          saleDate: invoice.saleDate,
          customer: invoice.customer,
          items: invoice.items.map(item => ({
            product: { name: item.productName },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxAmount: item.unitPrice * item.quantity * 0.15, // افتراض ضريبة 15%
            total: item.total * 1.15 // إضافة الضريبة للإجمالي
          })),
          subtotal: invoice.subtotal,
          taxAmount: invoice.tax,
          total: invoice.total,
          status: invoice.status,
          paymentStatus: invoice.paymentStatus,
          paymentMethod: invoice.paymentMethod,
          notes: invoice.notes || ''
        };
        
        this.showInvoiceDetailsModal(formattedInvoice);
      } else {
        throw new Error('لم يتم العثور على الفاتورة');
      }
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${invoiceId}`);
      
      if (response.ok) {
        const data = await response.json();
        this.showInvoiceDetailsModal(data.data.sale);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء جلب تفاصيل الفاتورة');
      }
      */
    } catch (error) {
      console.error('خطأ في عرض تفاصيل الفاتورة:', error);
      if (window.app) {
        window.app.showNotification(`حدث خطأ أثناء عرض تفاصيل الفاتورة: ${error.message}`, 'error');
      } else {
        alert(`حدث خطأ أثناء عرض تفاصيل الفاتورة: ${error.message}`);
      }
    }
  }

  /**
   * عرض نافذة تفاصيل الفاتورة
   */
  showInvoiceDetailsModal(invoice) {
    const detailsModal = document.getElementById('invoiceDetailsModal');
    if (!detailsModal) return;
    
    // تعبئة بيانات الفاتورة
    document.getElementById('detailsInvoiceNumber').textContent = invoice.invoiceNumber;
    
    // تنسيق التاريخ باستخدام دالة التنسيق من الكائن الرئيسي إذا كانت متاحة
    if (window.app && window.app.formatDate) {
      document.getElementById('detailsDate').textContent = window.app.formatDate(invoice.saleDate);
    } else {
      document.getElementById('detailsDate').textContent = new Date(invoice.saleDate).toLocaleDateString('ar-SA');
    }
    
    document.getElementById('detailsCustomer').textContent = invoice.customer ? invoice.customer.name : 'عميل نقدي';
    document.getElementById('detailsStatus').textContent = this.getStatusText(invoice.status);
    document.getElementById('detailsPaymentStatus').textContent = this.getPaymentStatusText(invoice.paymentStatus);
    document.getElementById('detailsPaymentMethod').textContent = invoice.paymentMethod;
    document.getElementById('detailsNotes').textContent = invoice.notes || 'لا توجد ملاحظات';
    
    // تعبئة جدول المنتجات
    const itemsTableBody = document.getElementById('detailsItemsBody');
    itemsTableBody.innerHTML = '';
    
    invoice.items.forEach(item => {
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
      document.getElementById('detailsSubtotal').textContent = window.app.formatCurrency(invoice.subtotal);
      document.getElementById('detailsTax').textContent = window.app.formatCurrency(invoice.taxAmount);
      document.getElementById('detailsTotal').textContent = window.app.formatCurrency(invoice.total);
    } else {
      document.getElementById('detailsSubtotal').textContent = `${invoice.subtotal.toFixed(2)} ريال`;
      document.getElementById('detailsTax').textContent = `${invoice.taxAmount.toFixed(2)} ريال`;
      document.getElementById('detailsTotal').textContent = `${invoice.total.toFixed(2)} ريال`;
    }
    
    // إظهار النافذة
    if (window.app) {
      window.app.openModal(detailsModal);
    } else {
      detailsModal.style.display = 'block';
    }
    
    // زر الطباعة
    const printBtn = document.getElementById('printInvoiceBtn');
    if (printBtn) {
      // إزالة مستمعي الأحداث السابقة
      const newPrintBtn = printBtn.cloneNode(true);
      printBtn.parentNode.replaceChild(newPrintBtn, printBtn);
      
      newPrintBtn.addEventListener('click', () => this.printInvoice(invoice.id));
    }
    
    // زر تحديث حالة الدفع
    const updatePaymentBtn = document.getElementById('updatePaymentBtn');
    if (updatePaymentBtn) {
      // إزالة مستمعي الأحداث السابقة
      const newUpdatePaymentBtn = updatePaymentBtn.cloneNode(true);
      updatePaymentBtn.parentNode.replaceChild(newUpdatePaymentBtn, updatePaymentBtn);
      
      if (invoice.paymentStatus !== 'paid') {
        newUpdatePaymentBtn.style.display = 'inline-block';
        newUpdatePaymentBtn.addEventListener('click', () => this.updatePaymentStatus(invoice.id));
      } else {
        newUpdatePaymentBtn.style.display = 'none';
      }
    }
  }

  /**
   * تحديث حالة الدفع
   */
  async updatePaymentStatus(invoiceId) {
    try {
      // للتطوير فقط: محاكاة تحديث حالة الدفع
      console.log(`تحديث حالة الدفع للفاتورة ${invoiceId} إلى مدفوع`);
      
      this.showMessage('تم تحديث حالة الدفع بنجاح', 'success');
      
      // إغلاق نافذة التفاصيل
      const detailsModal = document.getElementById('invoiceDetailsModal');
      if (detailsModal) {
        detailsModal.style.display = 'none';
      }
      
      // إعادة تحميل قائمة المبيعات
      this.loadSales();
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${invoiceId}/payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          paymentMethod: 'نقدي'
        })
      });
      
      if (response.ok) {
        this.showMessage('تم تحديث حالة الدفع بنجاح', 'success');
        
        // إغلاق نافذة التفاصيل
        const detailsModal = document.getElementById('invoiceDetailsModal');
        if (detailsModal) {
          detailsModal.style.display = 'none';
        }
        
        // إعادة تحميل قائمة المبيعات
        this.loadSales();
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
   * إلغاء الفاتورة
   */
  async cancelInvoice(invoiceId) {
    // استخدام مربع حوار التأكيد من الكائن الرئيسي إذا كان متاحًا
    let confirmed = false;
    if (window.app && window.app.showConfirmDialog) {
      confirmed = await window.app.showConfirmDialog('هل أنت متأكد من إلغاء هذه الفاتورة؟');
    } else {
      confirmed = confirm('هل أنت متأكد من إلغاء هذه الفاتورة؟');
    }
    
    if (!confirmed) {
      return;
    }
    
    try {
      console.log(`إلغاء الفاتورة ${invoiceId}`);
      
      // للتطوير فقط: تحديث حالة الفاتورة محليًا
      const invoiceIndex = this.sales.findIndex(sale => sale.id === invoiceId);
      if (invoiceIndex !== -1) {
        this.sales[invoiceIndex].status = 'cancelled';
        this.renderSalesTable(this.sales);
        
        // إغلاق نافذة التفاصيل إذا كانت مفتوحة
        const detailsModal = document.getElementById('invoiceDetailsModal');
        if (detailsModal && detailsModal.style.display === 'block') {
          if (window.app) {
            window.app.closeModal(detailsModal);
          } else {
            detailsModal.style.display = 'none';
          }
        }
        
        this.showMessage('تم إلغاء الفاتورة بنجاح', 'success');
      } else {
        throw new Error('لم يتم العثور على الفاتورة');
      }
      
      // في المستقبل، استبدل هذا بطلب API حقيقي
      /*
      const response = await fetch(`${this.apiUrl}/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'development-token'}`
        }
      });
      
      if (response.ok) {
        this.showMessage('تم إلغاء الفاتورة بنجاح', 'success');
        
        // إعادة تحميل قائمة المبيعات
        this.loadSales();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء إلغاء الفاتورة');
      }
      */
    } catch (error) {
      console.error('خطأ في إلغاء الفاتورة:', error);
      this.showMessage(`حدث خطأ أثناء إلغاء الفاتورة: ${error.message}`, 'error');
    }
  }

  /**
   * طباعة الفاتورة
   */
  printInvoice(invoiceId) {
    // للتطوير فقط: فتح نافذة طباعة
    window.open(`/print-invoice.html?id=${invoiceId}`, '_blank');
  }

  /**
   * تصفية المبيعات حسب النص
   */
  filterSales(searchText) {
    // للتطوير: تنفيذ وظيفة البحث
    console.log(`البحث عن: ${searchText}`);
  }

  /**
   * تصفية المبيعات حسب التاريخ
   */
  filterSalesByDate(startDate, endDate) {
    // للتطوير: تنفيذ وظيفة التصفية حسب التاريخ
    console.log(`تصفية من ${startDate} إلى ${endDate}`);
  }

  /**
   * تصفية المبيعات حسب الحالة
   */
  filterSalesByStatus(status) {
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

// تهيئة مدير المبيعات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.salesManager = new SalesManager();
});