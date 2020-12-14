var createError = require('http-errors');
var express = require('express');
var path = require('path');
var passport = require('passport');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var signRouter = require('./routes/sign');
var addTaskRouter = require('./routes/add-task');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser('12345-67890-09876-54321'));

app.use(session({
  key: 'user_sid',
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,
  resave: false,
  //store: new FileStore(),
  cookie: {
    expires: 600000
}
}))

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});



//app.use(passport.initialize());
//app.use(passport.session());


app.use('/', indexRouter);
app.use('/sign', signRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/add-task', addTaskRouter);

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
