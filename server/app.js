/*
 * backend node app
 */

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');

// local modules
const indexRouter = require('./routes');

// Create Express application
const app = express();

// Install Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Path routing
app.use(indexRouter);

// Error handling
app.use(function(req, res, next) {
  // catch 404 and forward to error handler
  next(createError(404));
});
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json('error');
});

module.exports = app;
