const { sequelize, User, Role, Permission } = require('../models');
const bcrypt = require('bcrypt');
const config = require('../config/config');

const initializeDatabase = async () => {
  try {
    // مزامنة النماذج مع قاعدة البيانات
    console.log('جاري مزامنة النماذج مع قاعدة البيانات...');
    await sequelize.sync({ force: false, alter: true });
    console.log('تمت مزامنة النماذج بنجاح.');

    // إنشاء الأدوار والصلاحيات الافتراضية
    console.log('جاري إنشاء الأدوار والصلاحيات الافتراضية...');
    
    // إنشاء الصلاحيات
    const permissions = await Permission.bulkCreate([
      { name: 'manage_users', description: 'إدارة المستخدمين' },
      { name: 'manage_roles', description: 'إدارة الأدوار' },
      { name: 'manage_products', description: 'إدارة المنتجات' },
      { name: 'manage_inventory', description: 'إدارة المخزون' },
      { name: 'manage_sales', description: 'إدارة المبيعات' },
      { name: 'manage_purchases', description: 'إدارة المشتريات' },
      { name: 'manage_customers', description: 'إدارة العملاء' },
      { name: 'manage_suppliers', description: 'إدارة الموردين' },
      { name: 'view_reports', description: 'عرض التقارير' },
      { name: 'pos_access', description: 'الوصول لنقطة البيع' },
    ], { ignoreDuplicates: true });

    // إنشاء الأدوار
    const [adminRole, managerRole, cashierRole] = await Promise.all([
      Role.findOrCreate({
        where: { name: 'admin' },
        defaults: { name: 'admin', description: 'مدير النظام' }
      }),
      Role.findOrCreate({
        where: { name: 'manager' },
        defaults: { name: 'manager', description: 'مدير' }
      }),
      Role.findOrCreate({
        where: { name: 'cashier' },
        defaults: { name: 'cashier', description: 'كاشير' }
      })
    ]);

    // تعيين الصلاحيات للأدوار
    await adminRole[0].setPermissions(permissions.map(p => p.id));
    await managerRole[0].setPermissions(permissions
      .filter(p => !['manage_users', 'manage_roles'].includes(p.name))
      .map(p => p.id)
    );
    await cashierRole[0].setPermissions(
      permissions
        .filter(p => ['pos_access', 'manage_sales', 'manage_customers'].includes(p.name))
        .map(p => p.id)
    );

    // إنشاء مستخدم مسؤول افتراضي
    const adminUser = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'مدير النظام',
        isActive: true
      });
      await newAdmin.setRole(adminRole[0].id);
      console.log('تم إنشاء المستخدم المسؤول الافتراضي بنجاح.');
    }

    console.log('تمت تهيئة قاعدة البيانات بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('حدث خطأ أثناء تهيئة قاعدة البيانات:', error);
    process.exit(1);
  }
};

// تنفيذ التهيئة
initializeDatabase();
