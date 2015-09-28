/*jslint node: true */
/*jshint unused: false */
'use strict';

/**
 * Module dependencies.
 */
var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = require('express')();

require('./newrelic').init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
};

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) {
    throw err;
  }

  // add swagger-ui
  app.use(new SwaggerUi(swaggerExpress.runner.swagger));

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.VCAP_APP_PORT || 3000;
  app.listen(port);

  //The console logging must be removed as the test xml file will not be generated correctly, which will cause the build to fail.
  console.log('Listening port ' + port);
  console.log('To access the api directly, try this:');
  console.log('curl http://127.0.0.1:' + port + '/applications\n');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('404 - Not Found!');
  err.status = 404;
  res.render('404', {
    message: err.message,
    error: {},
  });
});
