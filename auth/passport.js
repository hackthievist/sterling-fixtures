/* eslint-disable func-names */
const LocalStrategy = require('passport-local');
const User = require('../controllers/promise').UserPromise;

module.exports = function (passport) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
  ((email, password, done) => {
    User.findOne({ email, isDeleted: false })
      .then((user) => {
        if (!user) { return done(null, false, { message: 'Incorrect username or password' }); }
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect username or password' });
        }

        return done(null, user);
      });
  })));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id, isDeleted: false })
      .then((user) => {
        done(null, user);
      });
  });
};
