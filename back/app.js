const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

//const indexRouter = require('./routes/index');
const signRouter = require('./routes/sign');
const addTaskRouter = require('./routes/add-task');
const taskListRouter = require('./routes/task-list');
const taskButtonRouter = require('./routes/taskButtons');

const app = express();
const PORT = process.env.PORT || 3006;
const db = require('./logic/models/dao');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(cookieParser('12345-67890-09876-54321'));

app.use(
  session({
    key: 'user_sid',
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    //store: new FileStore(),
    cookie: {
      expires: 600000,
    },
  })
);

app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

//app.use(passport.initialize());
//app.use(passport.session());

// app.use('/', indexRouter);
app.use('/sign', signRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/add-task', addTaskRouter);
app.use('/task-list', taskListRouter);
app.use('/task-button', taskButtonRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

db.authenticate()
  .then(() => {
    console.log('Database connected');
    db.sync().then(() => console.log('Database synchronized'));
  })
  .catch((err) => console.error(err));

app.listen(PORT, console.log(`App listening on port : ${PORT}`));

module.exports = app;
