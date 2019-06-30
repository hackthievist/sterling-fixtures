const rateLimit = require('express-rate-limit');

module.exports.limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: {
      code: 429,
      cause: 'Rate Limit',
      message: 'Here\'s a chill pill, wait 15 minutes',
    },
  },
});
