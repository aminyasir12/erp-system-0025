const session = require('express-session');

module.exports = {
  secret: process.env.SESSION_SECRET || 'default_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
};