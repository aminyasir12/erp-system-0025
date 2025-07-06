-- \c pos_system;

-- إنشاء قاعدة البيانات
-- CREATE DATABASE pos_system 
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'Arabic_Saudi Arabia.1256'
--     LC_CTYPE = 'Arabic_Saudi Arabia.1256'
--     TEMPLATE = template0;

-- تمكين uuid-ossp extension لإنشاء معرفات فريدة
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'cashier', 'manager')) DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء دالة لتعيين updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- جدول العملاء
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_number VARCHAR(50),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    cost_price DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 15.00,
    quantity_in_stock INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    unit VARCHAR(20) DEFAULT 'piece',
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الموردين
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    tax_number VARCHAR(50),
    balance DECIMAL(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول المشتريات
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    paid_amount DECIMAL(12, 2) NOT NULL,
    due_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit', 'bank_transfer', 'check')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول تفاصيل المشتريات
CREATE TABLE IF NOT EXISTS purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول المبيعات
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) NOT NULL,
    due_amount DECIMAL(12, 2) DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'wallet')),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول تفاصيل المبيعات
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) DEFAULT 0.00,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول المدفوعات
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(50),
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'bank_transfer', 'check')),
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('sale', 'purchase', 'expense', 'income')),
    related_id INTEGER,
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول المصروفات
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'bank', 'card')),
    reference VARCHAR(100),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول المخزون
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('purchase', 'sale', 'adjustment', 'return')),
    reference_id INTEGER,
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_group VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON purchases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON sales
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدخال إعدادات افتراضية
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'store_name') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('store_name', 'متجرنا', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'store_address') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('store_address', 'العنوان', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'store_phone') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('store_phone', '0123456789', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'store_email') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('store_email', 'info@example.com', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'tax_rate') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('tax_rate', '15', 'tax');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'currency') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('currency', 'ريال', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'currency_position') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('currency_position', 'right', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'date_format') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('date_format', 'Y-m-d', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'time_format') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('time_format', 'H:i:s', 'general');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'receipt_header') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('receipt_header', 'مرحباً بكم في متجرنا', 'receipt');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM settings WHERE setting_key = 'receipt_footer') THEN
        INSERT INTO settings (setting_key, setting_value, setting_group) 
        VALUES ('receipt_footer', 'شكراً لزيارتكم', 'receipt');
    END IF;
END $$;

-- إنشاء مستخدم مدير افتراضي (كلمة المرور: admin123)
-- يجب تغيير كلمة المرور بعد تسجيل الدخول الأول
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
        INSERT INTO users (username, password, name, email, role) 
        VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'مدير النظام', 'admin@example.com', 'admin');
    END IF;
END $$;

-- إنشاء فئات افتراضية
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'أجهزة إلكترونية') THEN
        INSERT INTO categories (name, description) 
        VALUES ('أجهزة إلكترونية', 'الأجهزة الإلكترونية بأنواعها');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'ملابس') THEN
        INSERT INTO categories (name, description) 
        VALUES ('ملابس', 'الملابس بأنواعها');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM categories WHERE name = 'أغذية') THEN
        INSERT INTO categories (name, description) 
        VALUES ('أغذية', 'المواد الغذائية');
    END IF;
END $$;

-- إنشاء منتجات افتراضية
INSERT INTO products (barcode, name, description, category_id, cost_price, selling_price, quantity_in_stock) VALUES
('P001', 'هاتف ذكي', 'هاتف ذكي بمواصفات عالية', 1, 1000, 1500, 50),
('P002', 'لابتوب', 'لابتوب قوي للأعمال', 1, 2000, 3000, 20),
('P003', 'تيشيرت', 'تيشيرت قطني', 2, 50, 100, 200),
('P004', 'أرز', 'أرز بسمتي عالي الجودة', 3, 30, 50, 500)
ON CONFLICT (barcode) DO NOTHING;