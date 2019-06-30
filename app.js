const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const teamRouter = require('./routes/team');
const userRouter = require('./routes/user');
const fixtureRouter = require('./routes/fixture');
const searchRouter = require('./routes/search');

const database = process.env.NODE_ENV !== 'test' ? process.env.MONGO_URI : process.env.MONGO_TEST_URI;

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());
require('./auth/passport')(passport);

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/team', teamRouter);
app.use('/fixture', fixtureRouter);
app.use('/search', searchRouter);

mongoose.connect(database, { useNewUrlParser: true }, (err, client) => {
  if (err) throw new Error(err);
  return 'Mongodb Connection passed';
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;
db.once('open', () => 'Connected to Mongodb');
// check if error
db.on('error', console.error.bind(console, 'Mongodb connection error:'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
