/**
 * نظام إدارة الأعمال - وحدة المخزون
 * ملف الجافاسكريبت الخاص بصفحة المخزون
 * 
 * يوفر هذا الملف وظائف إدارة المخزون بما في ذلك:
 * - إضافة حركات المخزون (شراء، بيع، تحويل، تعديل، مرتجع)
 * - عرض المنتجات في المخزون
 * - تحديث حالة المنتجات بناءً على الكمية المتوفرة
 * - عرض إحصائيات المخزون
 */

class InventoryManager {
  constructor() {
    // تخزين المنتجات
    this.products = [
      {
        id: 1,
        name: 'هاتف ذكي XYZ',
        sku: 'PRD-1001',
        category: 'إلكترونيات',
        quantity: 25,
        minQuantity: 10,
        costPrice: 1200,
        sellingPrice: 1500,
        status: 'متوفر',
        image: 'https://via.placeholder.com/50'
      },
      {
        id: 2,
        name: 'حاسوب محمول ABC',
        sku: 'PRD-1002',
        category: 'إلكترونيات',
        quantity: 8,
        minQuantity: 5,
        costPrice: 2800,
        sellingPrice: 3500,
        status: 'منخفض',
        image: 'https://via.placeholder.com/50'
      },
      {
        id: 3,
        name: 'سماعات لاسلكية',
        sku: 'PRD-1003',
        category: 'ملحقات',
        quantity: 0,
        minQuantity: 15,
        costPrice: 150,
        sellingPrice: 250,
        status: 'منتهي',
        image: 'https://via.placeholder.com/50'
      }
    ];
    
    // تخزين حركات المخزون
    this.transactions = [];
    
    // تخزين المستودعات
    this.warehouses = [
      { id: 1, name: 'المستودع الرئيسي' },
      { id: 2, name: 'فرع الرياض' },
      { id: 3, name: 'فرع جدة' }
    ];
    
    // تهيئة الصفحة
    this.initPage();
  }
  
  /**
   * تهيئة الصفحة
   */
  initPage() {
    console.log('بدء تهيئة صفحة المخزون...');
    
    // تهيئة النماذج
    this.initForms();
    
    // تهيئة Select2
    this.initSelect2();
    
    // تهيئة مستمعات الأحداث
    this.initEventListeners();
    
    // تحديث واجهة المستخدم
    this.updateInventoryUI();
    
    console.log('تم الانتهاء من تهيئة صفحة المخزون');
  }
  
  /**
   * تهيئة النماذج
   */
  initForms() {
    console.log('بدء تهيئة النماذج...');
    
    // التحقق من وجود نموذج المخزون
    const inventoryForm = document.getElementById('inventoryForm');
    if (!inventoryForm) {
      console.warn('نموذج المخزون غير موجود');
      return;
    }
    
    // تعيين التاريخ الافتراضي إلى اليوم
    const dateInput = document.getElementById('transactionDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }
    
    console.log('تم الانتهاء من تهيئة النماذج');
  }
  
  /**
   * تهيئة مستمعات الأحداث
   */
  initEventListeners() {
    console.log('بدء تهيئة مستمعات الأحداث للمخزون...');
    
    // نموذج إضافة حركة مخزون
    const inventoryForm = document.getElementById('inventoryForm');
    if (inventoryForm) {
      console.log('تم العثور على نموذج المخزون');
      inventoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addInventoryTransaction();
      });
    } else {
      console.warn('لم يتم العثور على نموذج المخزون');
    }
    
    // زر إضافة حركة مخزون (Vanilla JS)
    const addInventoryBtn = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addInventoryModal"]');
    if (addInventoryBtn) {
      addInventoryBtn.addEventListener('click', () => {
        this.resetInventoryForm();
      });
    }
    
    // زر إضافة حركة مخزون (Bootstrap)
    const addInventoryBtnBootstrap = document.querySelector('[data-bs-toggle="modal"][data-bs-target="#addInventoryModal"]');
    if (addInventoryBtnBootstrap) {
      addInventoryBtnBootstrap.addEventListener('click', () => {
        this.resetInventoryForm();
      });
    }
    
    // تغيير نوع الحركة
    const transactionTypeSelect = document.getElementById('transactionType');
    if (transactionTypeSelect) {
      transactionTypeSelect.addEventListener('change', () => {
        this.handleTransactionTypeChange(transactionTypeSelect.value);
      });
    }
    
    // تغيير المنتج المحدد
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
      productSelect.addEventListener('change', () => {
        const selectedValue = productSelect.value;
        this.handleProductChange(selectedValue);
      });
    }
    
    // زر إضافة منتج سريع
    const quickAddProductBtn = document.getElementById('quickAddProductBtn');
    if (quickAddProductBtn) {
      console.log('تم العثور على زر إضافة منتج سريع');
      quickAddProductBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('تم النقر على زر إضافة منتج سريع');
        this.showQuickAddProductForm();
      });
    } else {
      console.warn('لم يتم العثور على زر إضافة منتج سريع');
    }
    
    // زر إضافة منتج كامل
    const fullAddProductBtn = document.getElementById('fullAddProductBtn');
    if (fullAddProductBtn) {
      console.log('تم العثور على زر إضافة منتج كامل');
      fullAddProductBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('تم النقر على زر إضافة منتج كامل');
        this.showAddProductPrompt();
      });
    } else {
      console.warn('لم يتم العثور على زر إضافة منتج كامل');
    }
    
    // زر تأكيد الإضافة السريعة
    const confirmQuickAddBtn = document.getElementById('confirmQuickAddBtn');
    if (confirmQuickAddBtn) {
      confirmQuickAddBtn.addEventListener('click', () => {
        this.confirmQuickAddProduct();
      });
    }
    
    // زر إلغاء الإضافة السريعة
    const cancelQuickAddBtn = document.getElementById('cancelQuickAddBtn');
    if (cancelQuickAddBtn) {
      cancelQuickAddBtn.addEventListener('click', () => {
        this.hideQuickAddProductForm();
      });
    }
    
    // نموذج إضافة منتج جديد
    const productForm = document.getElementById('productForm');
    if (productForm) {
      // إزالة مستمعات الأحداث السابقة لتجنب التكرار
      const newProductForm = productForm.cloneNode(true);
      productForm.parentNode.replaceChild(newProductForm, productForm);
      
      // إضافة مستمع جديد
      newProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveNewProduct();
      });
      
      // مستمع لحدث تغيير سعر التكلفة لحساب سعر البيع تلقائيًا
      const costPriceInput = document.getElementById('productCostPrice');
      const sellingPriceInput = document.getElementById('productSellingPrice');
      
      if (costPriceInput && sellingPriceInput) {
        costPriceInput.addEventListener('input', () => {
          const costPrice = parseFloat(costPriceInput.value) || 0;
          if (costPrice > 0 && !sellingPriceInput._userModified) {
            sellingPriceInput.value = Math.round(costPrice * 1.25); // هامش ربح افتراضي 25%
          }
        });
        
        // تتبع ما إذا كان المستخدم قد عدل سعر البيع يدويًا
        sellingPriceInput._userModified = false;
        sellingPriceInput.addEventListener('input', () => {
          sellingPriceInput._userModified = true;
        });
      }
    }
    
    // زر إلغاء في نموذج إضافة منتج جديد (Vanilla JS)
    const cancelProductBtn = document.querySelector('#addProductModal .btn-outline-secondary');
    if (cancelProductBtn) {
      cancelProductBtn.addEventListener('click', () => {
        const productModal = document.getElementById('addProductModal');
        if (productModal) {
          productModal.style.display = 'none';
          productModal.classList.remove('show');
        }
      });
    }
    
    console.log('تم الانتهاء من تهيئة مستمعات الأحداث للمخزون');
  }
  
  /**
   * تهيئة Select2 (jQuery للعمليات المعقدة)
   */
  initSelect2() {
    console.log('بدء تهيئة Select2...');
    
    // تهيئة Select2 للمنتجات (عملية معقدة)
    const productSelect = document.getElementById('productSelect');
    if (productSelect && typeof $ !== 'undefined' && $.fn.select2) {
      $(productSelect).select2({
        theme: 'bootstrap-5',
        placeholder: 'ابحث عن منتج...',
        allowClear: true,
        width: '100%'
      });
      
      console.log('تم تهيئة Select2 للمنتجات');
    }
    
    // تهيئة Select2 للمستودعات (عملية معقدة)
    const warehouseSelect = document.getElementById('warehouseSelect');
    if (warehouseSelect && typeof $ !== 'undefined' && $.fn.select2) {
      $(warehouseSelect).select2({
        theme: 'bootstrap-5',
        placeholder: 'اختر الفرع/المستودع',
        allowClear: true,
        width: '100%'
      });
      
      console.log('تم تهيئة Select2 للمستودعات');
    }
  }
  
  /**
   * معالجة تغيير المنتج المحدد
   * @param {string} productId - معرف المنتج
   */
  handleProductChange(productId) {
    if (!productId) return;
    
    const product = this.getProductById(productId);
    if (!product) return;
    
    // تعبئة سعر المنتج تلقائيًا بناءً على نوع الحركة
    const transactionType = document.getElementById('transactionType').value;
    const priceInput = document.getElementById('price');
    
    if (transactionType === 'purchase') {
      priceInput.value = product.costPrice;
    } else if (transactionType === 'sale') {
      priceInput.value = product.sellingPrice;
    }
    
    // تعيين الحد الأقصى للكمية في حالة البيع
    const quantityInput = document.getElementById('quantity');
    if (transactionType === 'sale' || transactionType === 'return') {
      quantityInput.setAttribute('max', product.quantity);
      
      // إذا كانت الكمية المتاحة أقل من الكمية المحددة، تعديل الكمية
      if (product.quantity < parseInt(quantityInput.value, 10)) {
        quantityInput.value = product.quantity;
      }
    }
  }
  
  /**
   * عرض نموذج الإضافة السريعة للمنتج
   */
  showQuickAddProductForm() {
    // إخفاء الأزرار
    document.getElementById('quickAddProductBtn').style.display = 'none';
    document.getElementById('fullAddProductBtn').style.display = 'none';
    
    // إظهار نموذج الإضافة السريعة
    const container = document.getElementById('quickAddProductContainer');
    container.style.display = 'block';
    
    // التركيز على حقل اسم المنتج
    document.getElementById('quickProductName').focus();
  }
  
  /**
   * إخفاء نموذج الإضافة السريعة للمنتج
   */
  hideQuickAddProductForm() {
    // إظهار الأزرار
    document.getElementById('quickAddProductBtn').style.display = 'inline-block';
    document.getElementById('fullAddProductBtn').style.display = 'inline-block';
    
    // إخفاء نموذج الإضافة السريعة
    const container = document.getElementById('quickAddProductContainer');
    container.style.display = 'none';
    
    // مسح الحقول
    document.getElementById('quickProductName').value = '';
    document.getElementById('quickProductCategory').value = 'عام';
    document.getElementById('quickProductMinStock').value = '5';
  }
  
  /**
   * تأكيد إضافة المنتج الجديد بسرعة
   */
  confirmQuickAddProduct() {
    // الحصول على بيانات المنتج الجديد
    const productName = document.getElementById('quickProductName').value.trim();
    const category = document.getElementById('quickProductCategory').value;
    const minStock = parseInt(document.getElementById('quickProductMinStock').value) || 5;
    
    // التحقق من إدخال اسم المنتج
    if (!productName) {
      this.showNotification('يرجى إدخال اسم المنتج', 'error');
      return;
    }
    
    // الحصول على السعر من النموذج الرئيسي
    const transactionType = document.getElementById('transactionType').value;
    const price = parseFloat(document.getElementById('price').value) || 0;
    
    // إنشاء بيانات المنتج الجديد
    const newProductData = {
      name: productName,
      category: category,
      quantity: 0, // سيتم تحديثه لاحقًا بناءً على الحركة
      costPrice: transactionType === 'purchase' ? price : 0,
      sellingPrice: transactionType === 'purchase' ? Math.round(price * 1.25) : price, // هامش ربح افتراضي 25%
      minQuantity: minStock
    };
    
    // إضافة المنتج الجديد
    const newProduct = this.addProduct(newProductData);
    
    // تحديث القائمة المنسدلة وتحديد المنتج الجديد
    this.addProductToSelect(newProduct);
    
    // إخفاء نموذج الإضافة السريعة
    this.hideQuickAddProductForm();
    
    // عرض رسالة نجاح
    this.showNotification(`تمت إضافة منتج جديد: ${newProduct.name}`, 'success');
    
    // تحديد المنتج الجديد في القائمة المنسدلة
    const productSelect = document.getElementById('productSelect');
    if (productSelect) {
      productSelect.value = newProduct.id;
      // إطلاق حدث تغيير
      const event = new Event('change');
      productSelect.dispatchEvent(event);
    }
  }
  
  /**
   * إعادة تعيين نموذج المخزون
   */
  resetInventoryForm() {
    const form = document.getElementById('inventoryForm');
    if (form) {
      form.reset();
      
      // تعيين التاريخ الافتراضي إلى اليوم
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('transactionDate').value = today;
      
      // إعادة تعيين القائمة المنسدلة
      const productSelect = document.getElementById('productSelect');
      if (productSelect) {
        productSelect.value = '';
        // إطلاق حدث تغيير
        const event = new Event('change');
        productSelect.dispatchEvent(event);
      }
    }
  }
  
  /**
   * معالجة تغيير نوع الحركة
   * @param {string} type - نوع الحركة
   */
  handleTransactionTypeChange(type) {
    const quantityInput = document.getElementById('quantity');
    const priceInput = document.getElementById('price');
    const productSelect = document.getElementById('productSelect');
    
    // تعديل الحقول بناءً على نوع الحركة
    if (type === 'sale' || type === 'return') {
      // للمبيعات والمرتجعات، يجب ألا تتجاوز الكمية المتاحة
      const productId = productSelect.value;
      if (productId) {
        const product = this.getProductById(productId);
        if (product) {
          quantityInput.setAttribute('max', product.quantity);
          
          // إذا كانت الكمية المتاحة أقل من الكمية المحددة، تعديل الكمية
          if (product.quantity < parseInt(quantityInput.value, 10)) {
            quantityInput.value = product.quantity;
          }
          
          // تعيين سعر البيع
          if (type === 'sale') {
            priceInput.value = product.sellingPrice;
          }
        }
      }
    } else {
      // للمشتريات والتحويلات والتعديلات، لا يوجد حد أقصى
      quantityInput.removeAttribute('max');
      
      // تعيين سعر الشراء للمشتريات
      if (type === 'purchase') {
        const productId = productSelect.value;
        if (productId) {
          const product = this.getProductById(productId);
          if (product) {
            priceInput.value = product.costPrice;
          }
        }
      }
    }
    
    // تعديل تسمية الحقول بناءً على نوع الحركة
    if (type === 'sale') {
      priceInput.previousElementSibling.textContent = 'سعر البيع';
    } else if (type === 'purchase') {
      priceInput.previousElementSibling.textContent = 'سعر الشراء';
    } else if (type === 'transfer') {
      priceInput.previousElementSibling.textContent = 'سعر التحويل';
    } else if (type === 'adjustment') {
      priceInput.previousElementSibling.textContent = 'سعر التعديل';
    } else if (type === 'return') {
      priceInput.previousElementSibling.textContent = 'سعر المرتجع';
    } else {
      priceInput.previousElementSibling.textContent = 'السعر';
    }
  }
  
  /**
   * إضافة منتج جديد بسرعة من القائمة المنسدلة
   * تم حذف هذه الدالة واستبدالها بنظام جديد
   */
  // quickAddProduct() { ... } - تم حذفها

  /**
   * إضافة حركة مخزون جديدة
   */
  addInventoryTransaction() {
    // جمع بيانات النموذج
    const transactionData = {
      type: document.getElementById('transactionType').value,
      date: document.getElementById('transactionDate').value,
      productId: document.getElementById('productSelect').value,
      quantity: parseInt(document.getElementById('quantity').value, 10),
      price: parseFloat(document.getElementById('price').value),
      warehouseId: document.getElementById('warehouseSelect').value,
      notes: document.getElementById('notes').value,
      id: Date.now() // استخدام الطابع الزمني كمعرف مؤقت
    };
    
    // التحقق من صحة البيانات
    if (!this.validateTransactionData(transactionData)) {
      return;
    }
    
    // التحقق من وجود المنتج
    const product = this.getProductById(transactionData.productId);
    if (!product) {
      this.showNotification('يرجى اختيار منتج صحيح', 'error');
      return;
    }
    
    // إضافة الحركة إلى قائمة الحركات
    this.transactions.push(transactionData);
    
    // تحديث مخزون المنتج
    this.updateProductStock(transactionData);
    
    // تحديث واجهة المستخدم
    this.updateInventoryUI();
    
    // إغلاق النافذة المنبثقة
    const modal = bootstrap.Modal.getInstance(document.getElementById('addInventoryModal'));
    if (modal) {
      modal.hide();
    }
    
    // عرض رسالة نجاح
    this.showNotification('تمت إضافة حركة المخزون بنجاح', 'success');
  }
  
  /**
   * التحقق من صحة بيانات الحركة
   * @param {Object} data - بيانات الحركة
   * @returns {boolean} - صحة البيانات
   */
  validateTransactionData(data) {
    // التحقق من اختيار نوع الحركة
    if (!data.type) {
      this.showNotification('يرجى اختيار نوع الحركة', 'error');
      return false;
    }
    
    // التحقق من اختيار المنتج
    if (!data.productId) {
      this.showNotification('يرجى اختيار المنتج', 'error');
      return false;
    }
    
    // التحقق من صحة الكمية
    if (data.quantity <= 0) {
      this.showNotification('يجب أن تكون الكمية أكبر من صفر', 'error');
      return false;
    }
    
    // التحقق من صحة السعر
    if (data.price <= 0) {
      this.showNotification('يجب أن يكون السعر أكبر من صفر', 'error');
      return false;
    }
    
    // التحقق من اختيار المستودع
    if (!data.warehouseId) {
      this.showNotification('يرجى اختيار الفرع/المستودع', 'error');
      return false;
    }
    
    // التحقق من توفر المخزون للمبيعات
    if (data.type === 'sale' || data.type === 'return') {
      const product = this.getProductById(data.productId);
      if (product && product.quantity < data.quantity) {
        this.showNotification(`الكمية المتوفرة غير كافية. المتوفر: ${product.quantity}`, 'error');
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * تحديث مخزون المنتج بناءً على الحركة
   * @param {Object} transaction - بيانات الحركة
   */
  updateProductStock(transaction) {
    const product = this.getProductById(transaction.productId);
    if (!product) return;
    
    // تحديث الكمية بناءً على نوع الحركة
    switch (transaction.type) {
      case 'purchase':
        // زيادة المخزون للمشتريات
        product.quantity += transaction.quantity;
        break;
      case 'sale':
        // نقص المخزون للمبيعات
        product.quantity -= transaction.quantity;
        break;
      case 'return':
        // زيادة المخزون للمرتجعات
        product.quantity += transaction.quantity;
        break;
      case 'adjustment':
        // تعديل المخزون (استبدال القيمة)
        product.quantity = transaction.quantity;
        break;
      case 'transfer':
        // لا تغيير في إجمالي المخزون للتحويلات بين المستودعات
        // في نظام حقيقي، سيتم تحديث مخزون المستودعات المعنية
        break;
    }
    
    // تحديث حالة المنتج
    this.updateProductStatus(product);
  }
  
  /**
   * تحديث حالة المنتج بناءً على الكمية
   * @param {Object} product - بيانات المنتج
   */
  updateProductStatus(product) {
    if (product.quantity <= 0) {
      product.status = 'منتهي';
    } else if (product.quantity <= product.minQuantity) {
      product.status = 'منخفض';
    } else {
      product.status = 'متوفر';
    }
  }
  
  /**
   * الحصول على منتج بواسطة المعرف
   * @param {string|number} id - معرف المنتج
   * @returns {Object|null} - بيانات المنتج أو null إذا لم يتم العثور عليه
   */
  getProductById(id) {
    // تحويل المعرف إلى رقم للمقارنة
    const numericId = parseInt(id, 10);
    return this.products.find(product => product.id === numericId) || null;
  }
  
  /**
   * تحديث واجهة المستخدم بعد إضافة حركة
   */
  updateInventoryUI() {
    // تحديث جدول المنتجات
    this.updateProductsTable();
    
    // تحديث إحصائيات المخزون
    this.updateInventoryStats();
  }
  
  /**
   * تحديث جدول المنتجات
   */
  updateProductsTable() {
    const tableBody = document.querySelector('#inventoryTable tbody');
    if (!tableBody) return;
    
    // مسح الجدول الحالي
    tableBody.innerHTML = '';
    
    // إضافة المنتجات إلى الجدول
    this.products.forEach(product => {
      // تحديد لون حالة المخزون
      let stockClass = 'high-stock';
      let badgeClass = 'bg-success';
      let statusText = 'متوفر';
      
      if (product.quantity <= 0) {
        stockClass = 'low-stock';
        badgeClass = 'bg-danger';
        statusText = 'منتهي';
      } else if (product.quantity <= product.minQuantity) {
        stockClass = 'medium-stock';
        badgeClass = 'bg-warning';
        statusText = 'منخفض';
      }
      
      // تنسيق الأسعار بشكل مناسب
      const formattedCostPrice = product.costPrice.toLocaleString('ar-SA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      const formattedSellingPrice = product.sellingPrice.toLocaleString('ar-SA', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // إنشاء صف الجدول
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${product.id}</td>
        <td>
          <div class="d-flex align-items-center">
            <img src="${product.image}" alt="Product" class="product-image me-2">
            <div>
              <div class="fw-medium">${product.name}</div>
              <small class="text-muted">${product.sku}</small>
            </div>
          </div>
        </td>
        <td>${product.sku}</td>
        <td>${product.category}</td>
        <td>
          <span class="${stockClass}">${product.quantity}</span>
          <small class="text-muted d-block">الحد الأدنى: ${product.minQuantity}</small>
        </td>
        <td>${formattedCostPrice} ر.س</td>
        <td>${formattedSellingPrice} ر.س</td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td class="action-buttons">
          <button class="btn btn-sm btn-outline-primary view-product" data-product-id="${product.id}" title="عرض">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary edit-product" data-product-id="${product.id}" title="تعديل">
            <i class="fas fa-edit"></i>
          </button>
        </td>
      `;
      
      // إضافة الصف إلى الجدول
      tableBody.appendChild(row);
    });
    
    // إضافة مستمعات الأحداث لأزرار العرض والتعديل
    this.addProductActionListeners();
    
    // إعادة تهيئة DataTable
    if ($.fn.DataTable.isDataTable('#inventoryTable')) {
      $('#inventoryTable').DataTable().destroy();
    }
    
    $('#inventoryTable').DataTable({
      language: {
        url: '//cdn.datatables.net/plug-ins/1.11.5/i18n/ar.json'
      },
      order: [[0, 'desc']]
    });
  }
  
  /**
   * إضافة مستمعات الأحداث لأزرار العرض والتعديل في جدول المنتجات
   */
  addProductActionListeners() {
    // أزرار عرض المنتج
    const viewButtons = document.querySelectorAll('.view-product');
    viewButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.currentTarget.getAttribute('data-product-id');
        const product = this.getProductById(productId);
        if (product) {
          this.showProductDetails(product);
        }
      });
    });
    
    // أزرار تعديل المنتج
    const editButtons = document.querySelectorAll('.edit-product');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const productId = e.currentTarget.getAttribute('data-product-id');
        const product = this.getProductById(productId);
        if (product) {
          this.showEditProductForm(product);
        }
      });
    });
  }
  
  /**
   * عرض تفاصيل المنتج
   * @param {Object} product - بيانات المنتج
   */
  showProductDetails(product) {
    // في الإصدار الحالي، نعرض فقط رسالة تأكيد
    this.showNotification(`عرض تفاصيل المنتج: ${product.name}`, 'info');
    
    // يمكن تنفيذ عرض تفاصيل المنتج في نافذة منبثقة في المستقبل
  }
  
  /**
   * عرض نموذج تعديل المنتج
   * @param {Object} product - بيانات المنتج
   */
  showEditProductForm(product) {
    // في الإصدار الحالي، نعرض فقط رسالة تأكيد
    this.showNotification(`تعديل المنتج: ${product.name}`, 'info');
    
    // يمكن تنفيذ نموذج تعديل المنتج في المستقبل
  }
  
  /**
   * تحديث إحصائيات المخزون
   */
  updateInventoryStats() {
    // حساب الإحصائيات
    const totalProducts = this.products.length;
    const inStock = this.products.filter(p => p.quantity > p.minQuantity).length;
    const lowStock = this.products.filter(p => p.quantity > 0 && p.quantity <= p.minQuantity).length;
    const outOfStock = this.products.filter(p => p.quantity <= 0).length;
    
    // تحديث العناصر في واجهة المستخدم
    const statElements = document.querySelectorAll('.stat-card .value');
    if (statElements.length >= 3) {
      statElements[0].textContent = inStock;
      statElements[1].textContent = lowStock;
      statElements[2].textContent = outOfStock;
    }
  }
  
  /**
   * عرض إشعار للمستخدم
   * @param {string} message - نص الإشعار
   * @param {string} type - نوع الإشعار (success, error, warning, info)
   */
  showNotification(message, type = 'info') {
    // استخدام وظيفة الإشعارات العامة إذا كانت متوفرة
    if (window.app && window.app.showNotification) {
      window.app.showNotification(message, type);
      return;
    }
    
    // إنشاء إشعار بسيط إذا لم تكن وظيفة الإشعارات العامة متوفرة
    alert(message);
  }
  
  /**
   * إضافة منتج جديد إلى المخزون
   * @param {Object} productData - بيانات المنتج
   * @returns {Object} - المنتج المضاف
   */
  addProduct(productData) {
    // إنشاء معرف جديد
    const newId = this.products.length > 0 
      ? Math.max(...this.products.map(p => p.id)) + 1 
      : 1;
    
    // إنشاء رمز SKU جديد إذا لم يتم توفيره
    let sku = productData.sku;
    if (!sku || sku.trim() === '') {
      sku = `PRD-${String(1000 + newId).substring(1)}`;
    }
    
    // إنشاء المنتج الجديد
    const newProduct = {
      id: newId,
      sku: sku,
      name: productData.name,
      category: productData.category || 'عام',
      quantity: productData.quantity || 0,
      minQuantity: productData.minQuantity || 5,
      costPrice: productData.costPrice || 0,
      sellingPrice: productData.sellingPrice || 0,
      image: productData.image || 'https://via.placeholder.com/50',
      status: 'متوفر'
    };
    
    // تحديث حالة المنتج بناءً على الكمية
    this.updateProductStatus(newProduct);
    
    // إضافة المنتج إلى القائمة
    this.products.push(newProduct);
    
    // إضافة المنتج إلى قائمة المنتجات في النموذج
    this.addProductToSelect(newProduct);
    
    // تحديث واجهة المستخدم
    this.updateProductsTable();
    this.updateInventoryStats();
    
    console.log('تمت إضافة منتج جديد:', newProduct);
    
    return newProduct;
  }
  
  /**
   * إضافة منتج إلى قائمة المنتجات في النموذج
   * @param {Object} product - بيانات المنتج
   */
  addProductToSelect(product) {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    // إنشاء خيار جديد
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} (${product.sku})`;
    
    // إضافة الخيار قبل خيار "إضافة منتج جديد"
    const newProductOption = productSelect.querySelector('option[value="new"]');
    if (newProductOption) {
      productSelect.insertBefore(option, newProductOption);
    } else {
      productSelect.appendChild(option);
    }
    
    // تحديد المنتج الجديد
    productSelect.value = product.id;
    
    // إطلاق حدث تغيير
    const event = new Event('change');
    productSelect.dispatchEvent(event);
  }
  
  /**
   * عرض نموذج إضافة منتج جديد (Vanilla JS)
   */
  showAddProductPrompt() {
    console.log('عرض نموذج إضافة منتج جديد');
    
    // إخفاء نافذة إضافة حركة المخزون (Vanilla JS)
    const inventoryModal = document.getElementById('addInventoryModal');
    if (inventoryModal) {
      inventoryModal.style.display = 'none';
      inventoryModal.classList.remove('show');
    }
    
    // إظهار نافذة إضافة منتج جديد (Vanilla JS)
    setTimeout(() => {
      const productModal = document.getElementById('addProductModal');
      if (productModal) {
        productModal.style.display = 'block';
        productModal.classList.add('show');
      }
    }, 300);
  }
  
  /**
   * حفظ منتج جديد (Vanilla JS)
   */
  saveNewProduct() {
    console.log('حفظ منتج جديد');
    
    // جمع بيانات النموذج
    const productData = {
      name: document.getElementById('productName').value,
      category: document.getElementById('productCategory').value,
      sku: document.getElementById('productSku').value,
      costPrice: parseFloat(document.getElementById('productCostPrice').value) || 0,
      sellingPrice: parseFloat(document.getElementById('productSellingPrice').value) || 0,
      quantity: parseInt(document.getElementById('productInitialStock').value) || 0,
      minQuantity: parseInt(document.getElementById('productMinStock').value) || 5,
      image: document.getElementById('productImage').value || 'https://via.placeholder.com/50'
    };
    
    // التحقق من صحة البيانات
    if (!this.validateProductData(productData)) {
      return;
    }
    
    // إضافة المنتج الجديد
    const newProduct = this.addProduct(productData);
    
    // إغلاق نافذة إضافة منتج جديد (Vanilla JS)
    const productModal = document.getElementById('addProductModal');
    if (productModal) {
      productModal.style.display = 'none';
      productModal.classList.remove('show');
    }
    
    // إعادة فتح نافذة إضافة حركة المخزون (Vanilla JS)
    setTimeout(() => {
      const inventoryModal = document.getElementById('addInventoryModal');
      if (inventoryModal) {
        inventoryModal.style.display = 'block';
        inventoryModal.classList.add('show');
      }
      
      // تحديد المنتج الجديد في القائمة المنسدلة
      const productSelect = document.getElementById('productSelect');
      if (productSelect) {
        productSelect.value = newProduct.id;
        // إطلاق حدث تغيير
        const event = new Event('change');
        productSelect.dispatchEvent(event);
      }
      
      // تحديث حقول النموذج
      const priceInput = document.getElementById('price');
      const transactionType = document.getElementById('transactionType').value;
      
      if (transactionType === 'purchase') {
        priceInput.value = newProduct.costPrice;
      } else if (transactionType === 'sale') {
        priceInput.value = newProduct.sellingPrice;
      }
    }, 500);
    
    // عرض رسالة نجاح
    this.showNotification(`تمت إضافة منتج جديد: ${newProduct.name}`, 'success');
  }
  
  /**
   * التحقق من صحة بيانات المنتج
   * @param {Object} data - بيانات المنتج
   * @returns {boolean} - صحة البيانات
   */
  validateProductData(data) {
    // التحقق من إدخال اسم المنتج
    if (!data.name || data.name.trim() === '') {
      this.showNotification('يرجى إدخال اسم المنتج', 'error');
      return false;
    }
    
    // التحقق من صحة سعر التكلفة
    if (data.costPrice <= 0) {
      this.showNotification('يجب أن يكون سعر التكلفة أكبر من صفر', 'error');
      return false;
    }
    
    // التحقق من صحة سعر البيع
    if (data.sellingPrice <= 0) {
      this.showNotification('يجب أن يكون سعر البيع أكبر من صفر', 'error');
      return false;
    }
    
    // التحقق من أن سعر البيع أكبر من أو يساوي سعر التكلفة
    if (data.sellingPrice < data.costPrice) {
      this.showNotification('يجب أن يكون سعر البيع أكبر من أو يساوي سعر التكلفة', 'warning');
      // نسمح بالاستمرار رغم التحذير
    }
    
    return true;
  }
}

// تهيئة مدير المخزون عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // التأكد من أن الصفحة الحالية هي صفحة المخزون
  if (window.location.pathname.includes('inventory.html') || 
      document.querySelector('#inventoryForm') || 
      document.querySelector('#quickAddProductBtn')) {
    
    // التأكد من عدم وجود تضارب مع التطبيق الرئيسي
    if (!window.inventoryManager) {
      window.inventoryManager = new InventoryManager();
      console.log('تم تهيئة مدير المخزون بنجاح');
    } else {
      console.log('مدير المخزون موجود بالفعل');
    }
  }
});