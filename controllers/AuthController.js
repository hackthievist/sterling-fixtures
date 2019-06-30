/* eslint-disable consistent-return */
const passport = require('passport');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const ResponseHelper = require('./ResponseHelper');
const config = require('../config');

const jwtSecret = config.jwt.secret;

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
        const token = jwt.sign({ data: userInToken }, jwtSecret, { expiresIn: config.jwt.exp });
        return ResponseHelper.json(200, res, 'Login successful', { user, token });
      });
    })(req, res, next);
  },
};

module.exports = Auth;
