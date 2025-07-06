/**
 * إنشاء رقم فاتورة فريد
 * @returns {string} رقم الفاتورة
 */
const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // رقم عشوائي مكون من 4 أرقام
  
  return `INV-${year}${month}${day}-${random}`;
};

/**
 * تنسيق المبلغ المالي
 * @param {number} amount المبلغ
 * @param {string} currency العملة
 * @returns {string} المبلغ المنسق
 */
const formatCurrency = (amount, currency = 'SAR') => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * حساب إجمالي الفاتورة
 * @param {Array} items عناصر الفاتورة
 * @returns {Object} المجاميع (الإجمالي، الضريبة، الخصم)
 */
const calculateInvoiceTotals = (items) => {
  let subtotal = 0;
  let taxAmount = 0;
  let discount = 0;
  
  items.forEach(item => {
    const itemTotal = item.quantity * item.unitPrice;
    const itemDiscount = item.discount || 0;
    const itemTax = (item.taxRate || 0) * (itemTotal - itemDiscount) / 100;
    
    subtotal += itemTotal;
    taxAmount += itemTax;
    discount += itemDiscount;
  });
  
  const total = subtotal + taxAmount - discount;
  
  return {
    subtotal,
    taxAmount,
    discount,
    total
  };
};

module.exports = {
  generateInvoiceNumber,
  formatCurrency,
  calculateInvoiceTotals
};
