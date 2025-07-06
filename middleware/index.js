const errorHandler = require('./errorHandler');
const auth = require('./auth');
const error = require('./error');
const { logger } = require('../utils/logger');

module.exports = {
  errorHandler,
  auth,
  error,
  logger
};