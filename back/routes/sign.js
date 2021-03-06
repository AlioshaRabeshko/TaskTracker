const express = require('express');
const bodyParser = require('body-parser').json();

const User = require('../logic/models/user');
const coefficientHandler = require('../logic/coefficientHandler')
  .CoeffitientHandler;

const signRouter = express.Router();
signRouter.use(bodyParser);

const sessionChecker = (req, res, next) => {
  req.session.user && req.cookies.user_sid ? res.redirect('/') : next();
};

// signRouter.get('/', sessionChecker, function (req, res, next) {
// 	res.render('index', { title: 'Express' });
// });
/*
signRouter.get('/signIn',sessionChecker,(req,res,next) => {
    let token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});

  })


signRouter
.route('/login')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    })
    .post((req, res) => {
        let name = req.body.name,
            password = req.body.pass;

        User.findOne({ where: {name: name } })
          .then(function (user) {
            if (!user) {
              console.log("ccccccccc")
                res.redirect('/');
            } else if (!user.pass) {
              console.log("bbbbbbbbbb")
                res.redirect('/');
            } else {
                req.session.user = user.dataValues;

                console.log("aaaaaaaaa "  + req.session.user)
                res.redirect('/');
            }
        });
    });



*/

signRouter.post('/login', (req, res, next) => {
  if (!req.session.user) {
    User.findOne({where: {name: req.body.name}})
      .then((user) => {
        if (!user) {
          const err = new Error('User ' + req.body.name + ' does not exist!');
          err.status = 403;
          return next(err);
        } else if (user.pass !== req.body.pass) {
          const err = new Error('Your password is incorrect!');
          err.status = 403;
          return next(err);
        } else if (user.name === req.body.name && user.pass === req.body.pass) {
          req.session.user = 'authenticated';
          res.cookie('uid', user.id, {httpOnly: true});
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated!');
        }
      })
      .catch((err) => next(err));
  } else {
    // console.log( req.cookies['uid']);
    //  req.session.user = user.dataValues;
    // console.dir(req.cookies['session-id']);
    //   console.log(req.session.user);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

signRouter.post('/signUp', sessionChecker, (req, res, next) => {
  User.findOne({where: {name: req.body.name}})
    .then((user) => {
      if (user) {
        const err = new Error('User ' + req.body.name + ' already exists!');
        err.status = 403;
        next(err);
      } else {
        return User.findOne({where: {email: req.body.email}}).then((email) => {
          if (email) {
            const err = new Error(
              'This email: ' + req.body.email + ' already exists!'
            );
            console.log('Email error LOgger');
            err.status = 403;
            next(err);
          } else {
            User.create({
              name: req.body.name,
              pass: req.body.pass,
              email: req.body.email,
            }).then(() => {
              User.findOne({where: {name: req.body.name}}).then((user) => {
                coefficientHandler.initializeCoefficientEntries(user.id);
              });
            });
          }
        });
      }
    })
    .then((user) => {
      //  console.log(user.id);
      // return User.findOne({where: {name: req.body.name}}).then((user) => {
      //   coefficientHandler.initializeCoefficientEntries(user.id);
      // });
    })
    .then(
      (user) => {
        //  User.findOne({where: {name: req.body.name}}).then((users) => {
        //    coefficientHandler.initializeCoefficientEntries(users.id);
        //  });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        // req.session.user = user.dataValues;
        //  res.cookie('uid',req.body.name , { httpOnly: true });
        res.json({status: 'Registration Successful!', user: user});
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

signRouter.get('/logout', (req, res, next) => {
  if (req.session.user) {
    res.clearCookie('user_sid');
    res.clearCookie('uid');
    res.clearCookie('session-id');
    req.session.destroy();
    res.redirect('/');
  } else {
    let err = new Error('First you have to login');
    err.status = 403;
    next(err);
  }
});

module.exports = signRouter;
