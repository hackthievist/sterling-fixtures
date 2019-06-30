const jwt = require('jsonwebtoken');
const ResponseHelper = require('../controllers/ResponseHelper');
const User = require('../controllers/promise').UserPromise;
const jwtSecret = require('../config').jwt.secret;

module.exports = {
  async isAuthenticated(req, res, next) {
    try {
      if (!req.headers.authorization) return ResponseHelper.json(401, res, 'Authorization token not found');
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^bearer$/i.test(scheme)) {
          const decoded = await jwt.verify(credentials, jwtSecret);
          const user = await User.findOne({ _id: decoded.data._id, isDeleted: false });
          if (!user) return ResponseHelper.json(401, res, 'User from token does not exist');
          req.user = user;
          return next();
        }
      }
      return ResponseHelper.json(401, res, 'Invalid token');
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};
