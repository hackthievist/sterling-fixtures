/* eslint-disable consistent-return */
const passport = require('passport');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const ResponseHelper = require('./ResponseHelper');
const User = require('../controllers/promise').UserPromise;

const jwtSecret = process.env.JWT_SECRET;

const Auth = {
  async login(req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) { return next(err); }
      if (!user) {
        return res.status(400).send({ message: info.message });
      }
      req.logIn(user, (error) => {
        if (err) return next(error);
        const userInToken = _.pick(user, ['_id', 'name', 'email', 'userName', 'role']);
        const token = jwt.sign({ data: userInToken }, jwtSecret, { expiresIn: 60000 });
        return ResponseHelper.json(200, res, 'Login successful', { user, token });
      });
    })(req, res, next);
  },

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
          if (!user) return ResponseHelper.json(404, res, 'User from token does not exist');
          req.user = user;
          return next();
        }
      }
      return ResponseHelper.json(400, res, 'Invalid token');
    } catch (err) {
      return ResponseHelper.error(err, res);
    }
  },
};

module.exports = Auth;
