/**
 * نظام إدارة الأعمال - وحدة المحاسبة
 * ملف الجافاسكريبت الخاص بصفحة المحاسبة
 */

document.addEventListener('DOMContentLoaded', function() {
  // تهيئة النموذج
  initTransactionForm();
  
  // إضافة مستمعات الأحداث
  addEventListeners();
  
  // تحميل البيانات
  loadAccountingData();
});

/**
 * تهيئة نموذج المعاملات
 */
function initTransactionForm() {
  // تعيين التاريخ الافتراضي إلى اليوم
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('transactionDate').value = today;
  
  // إظهار/إخفاء حقل الحساب المستلم بناءً على نوع المعاملة
  const transactionType = document.getElementById('transactionType');
  const transferAccountContainer = document.querySelector('.transfer-account-container');
  
  transactionType.addEventListener('change', function() {
    if (this.value === 'transfer') {
      transferAccountContainer.classList.remove('d-none');
      document.getElementById('transferToAccount').setAttribute('required', 'required');
    } else {
      transferAccountContainer.classList.add('d-none');
      document.getElementById('transferToAccount').removeAttribute('required');
    }
  });
}

/**
 * إضافة مستمعات الأحداث
 */
function addEventListeners() {
  // حفظ المعاملة
  const saveTransactionBtn = document.getElementById('saveTransaction');
  if (saveTransactionBtn) {
    saveTransactionBtn.addEventListener('click', saveTransaction);
  }
  
  // تحديث الفئات بناءً على نوع المعاملة
  const transactionType = document.getElementById('transactionType');
  const categorySelect = document.getElementById('transactionCategory');
  
  if (transactionType && categorySelect) {
    transactionType.addEventListener('change', function() {
      updateCategoryOptions(this.value, categorySelect);
    });
  }
}

/**
 * تحديث خيارات الفئات بناءً على نوع المعاملة
 * @param {string} type - نوع المعاملة
 * @param {HTMLSelectElement} categorySelect - عنصر اختيار الفئة
 */
function updateCategoryOptions(type, categorySelect) {
  // حفظ القيمة الحالية
  const currentValue = categorySelect.value;
  
  // إزالة جميع الخيارات باستثناء الخيار الافتراضي
  while (categorySelect.options.length > 1) {
    categorySelect.remove(1);
  }
  
  // إضافة الخيارات المناسبة بناءً على النوع
  let options = [];
  
  if (type === 'income') {
    options = [
      { value: 'sales', text: 'مبيعات' },
      { value: 'services', text: 'خدمات' },
      { value: 'investments', text: 'استثمارات' },
      { value: 'other_income', text: 'إيرادات أخرى' }
    ];
  } else if (type === 'expense') {
    options = [
      { value: 'purchases', text: 'مشتريات' },
      { value: 'salaries', text: 'رواتب' },
      { value: 'rent', text: 'إيجار' },
      { value: 'utilities', text: 'مرافق' },
      { value: 'marketing', text: 'تسويق' },
      { value: 'office_supplies', text: 'مستلزمات مكتبية' },
      { value: 'other_expense', text: 'مصروفات أخرى' }
    ];
  } else if (type === 'transfer') {
    options = [
      { value: 'transfer', text: 'تحويل بين الحسابات' }
    ];
  }
  
  // إضافة الخيارات إلى القائمة
  options.forEach(option => {
    const optionElement = document.createElement('option');
    optionElement.value = option.value;
    optionElement.textContent = option.text;
    categorySelect.appendChild(optionElement);
  });
  
  // محاولة استعادة القيمة السابقة إذا كانت موجودة في الخيارات الجديدة
  if (currentValue) {
    for (let i = 0; i < categorySelect.options.length; i++) {
      if (categorySelect.options[i].value === currentValue) {
        categorySelect.value = currentValue;
        break;
      }
    }
  }
}

/**
 * حفظ المعاملة
 */
function saveTransaction() {
  // التحقق من صحة النموذج
  const form = document.getElementById('transactionForm');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // جمع بيانات النموذج
  const transactionData = {
    type: document.getElementById('transactionType').value,
    date: document.getElementById('transactionDate').value,
    amount: parseFloat(document.getElementById('transactionAmount').value),
    category: document.getElementById('transactionCategory').value,
    account: document.getElementById('transactionAccount').value,
    description: document.getElementById('transactionDescription').value,
    reference: document.getElementById('transactionReference').value
  };
  
  // إضافة الحساب المستلم إذا كان نوع المعاملة تحويل
  if (transactionData.type === 'transfer') {
    transactionData.toAccount = document.getElementById('transferToAccount').value;
  }
  
  // في بيئة الإنتاج، سيتم إرسال البيانات إلى الخادم هنا
  console.log('بيانات المعاملة:', transactionData);
  
  // إضافة المعاملة إلى الجدول (للعرض فقط)
  addTransactionToTable(transactionData);
  
  // إغلاق النافذة المنبثقة
  const modal = bootstrap.Modal.getInstance(document.getElementById('addTransaction'));
  if (modal) {
    modal.hide();
  } else if (window.app) {
    window.app.closeModal('addTransaction');
  } else {
    document.getElementById('addTransaction').style.display = 'none';
  }
  
  // إعادة تعيين النموذج
  form.reset();
  initTransactionForm();
  
  // عرض رسالة نجاح
  if (window.app) {
    window.app.showNotification('تم حفظ المعاملة بنجاح', 'success');
  } else {
    alert('تم حفظ المعاملة بنجاح');
  }
}

/**
 * إضافة معاملة إلى الجدول
 * @param {Object} transaction - بيانات المعاملة
 */
function addTransactionToTable(transaction) {
  const table = document.getElementById('transactionsTable');
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  // إنشاء صف جديد
  const row = document.createElement('tr');
  
  // تنسيق التاريخ
  const date = new Date(transaction.date);
  const formattedDate = date.toLocaleDateString('ar-SA');
  
  // تحديد لون ورمز نوع المعاملة
  let typeClass = '';
  let typeIcon = '';
  let typeText = '';
  
  if (transaction.type === 'income') {
    typeClass = 'text-success';
    typeIcon = 'fa-arrow-down';
    typeText = 'إيراد';
  } else if (transaction.type === 'expense') {
    typeClass = 'text-danger';
    typeIcon = 'fa-arrow-up';
    typeText = 'مصروف';
  } else if (transaction.type === 'transfer') {
    typeClass = 'text-info';
    typeIcon = 'fa-exchange-alt';
    typeText = 'تحويل';
  }
  
  // تحديد نص الفئة
  let categoryText = transaction.category;
  const categorySelect = document.getElementById('transactionCategory');
  if (categorySelect) {
    for (let i = 0; i < categorySelect.options.length; i++) {
      if (categorySelect.options[i].value === transaction.category) {
        categoryText = categorySelect.options[i].textContent;
        break;
      }
    }
  }
  
  // تحديد نص الحساب
  let accountText = transaction.account;
  const accountSelect = document.getElementById('transactionAccount');
  if (accountSelect) {
    for (let i = 0; i < accountSelect.options.length; i++) {
      if (accountSelect.options[i].value === transaction.account) {
        accountText = accountSelect.options[i].textContent;
        break;
      }
    }
  }
  
  // إضافة البيانات إلى الصف
  row.innerHTML = `
    <td>${formattedDate}</td>
    <td><span class="${typeClass}"><i class="fas ${typeIcon}"></i> ${typeText}</span></td>
    <td>${categoryText}</td>
    <td>${accountText}</td>
    <td>${transaction.description || '-'}</td>
    <td>${transaction.reference || '-'}</td>
    <td class="text-end ${transaction.type === 'income' ? 'text-success' : transaction.type === 'expense' ? 'text-danger' : ''}">
      ${transaction.amount.toLocaleString('ar-SA')} ريال
    </td>
    <td>
      <div class="btn-group">
        <button type="button" class="btn btn-sm btn-outline-secondary">
          <i class="fas fa-edit"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </td>
  `;
  
  // إضافة الصف إلى الجدول
  tbody.prepend(row);
  
  // تحديث ملخص الحسابات
  updateAccountingSummary();
}

/**
 * تحميل بيانات المحاسبة
 */
function loadAccountingData() {
  // في بيئة الإنتاج، سيتم جلب البيانات من الخادم هنا
  // للعرض التجريبي، سنستخدم بيانات وهمية
  
  // تحديث ملخص الحسابات
  updateAccountingSummary();
}

/**
 * تحديث ملخص الحسابات
 */
function updateAccountingSummary() {
  // في بيئة الإنتاج، سيتم حساب هذه القيم بناءً على البيانات الفعلية
  // للعرض التجريبي، سنستخدم قيم وهمية
  
  document.getElementById('totalIncome').textContent = '45,750.00 ريال';
  document.getElementById('totalExpenses').textContent = '28,320.00 ريال';
  document.getElementById('netProfit').textContent = '17,430.00 ريال';
  document.getElementById('cashBalance').textContent = '12,500.00 ريال';
  document.getElementById('bankBalance').textContent = '35,200.00 ريال';
  document.getElementById('accountsReceivable').textContent = '8,750.00 ريال';
  document.getElementById('accountsPayable').textContent = '5,320.00 ريال';
}