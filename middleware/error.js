module.exports = (err, req, res, next) => {
  console.error('❌ خطأ:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'حدث خطأ غير متوقع في الخادم'
  });
};