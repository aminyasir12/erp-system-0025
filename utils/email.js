const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const AppError = require('./AppError');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name?.split(' ')[0] || 'عزيزي المستخدم';
    this.url = url;
    this.from = `نظام إدارة الأعمال <${process.env.EMAIL_FROM}>`;
  }

  // إنشاء ناقل البريد الإلكتروني
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // استخدام SendGrid للإنتاج
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // استخدام Mailtrap للتطوير
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // إرسال البريد الإلكتروني الفعلي
  async send(template, subject) {
    try {
      // 1) تقديم قالب Pug
      const html = pug.renderFile(
        `${__dirname}/../views/emails/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject,
        }
      );

      // 2) تعريف خيارات البريد الإلكتروني
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html, { wordwrap: 130 }),
      };

      // 3) إنشاء ناقل وإرسال البريد الإلكتروني
      await this.newTransport().sendMail(mailOptions);
    } catch (err) {
      console.error('فشل في إرسال البريد الإلكتروني:', err);
      throw new AppError('حدث خطأ أثناء إرسال البريد الإلكتروني. الرجاء المحاولة مرة أخرى لاحقاً.', 500);
    }
  }

  // طرق محددة لأنواع مختلفة من رسائل البريد الإلكتروني
  async sendWelcome() {
    await this.send('welcome', 'مرحباً بك في نظام إدارة الأعمال!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'تعليمات إعادة تعيين كلمة المرور (صالحة لمدة 10 دقائق فقط)'
    );
  }

  async sendEmailVerification() {
    await this.send(
      'emailVerification',
      'التحقق من عنوان بريدك الإلكتروني (مطلوب)'
    );
  }
}

module.exports = Email;
