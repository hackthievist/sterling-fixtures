const ResponseHelper = require('../controllers/ResponseHelper');

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role === 'admin') return next();
  return ResponseHelper.json(401, res, 'Unauthorized: Admin Users only');
};
