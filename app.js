var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config/config.json');

var api_routes = require('./routes/api/index');
require('./models/db_connect');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  //decode token
  if(token) {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        req.auth = false;
        req.status = 401;
        req.message = 'Failed to authenticate token!';
      } else {
        req.auth = true;
        req.status = 200;
        req.user = decoded;
      }
    });

    if(token == config.secretToken) {
      req.auth = true;
      req.status = 200;
    }
  } else {
    req.auth = false;
    req.status = 403;
    req.message = 'No token provided!';
  }

  next();
});

app.use('/api', api_routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
  res.status(err.status).json(err);
});

module.exports = app;
