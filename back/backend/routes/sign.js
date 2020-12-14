let express = require('express');
const bodyParser = require('body-parser');
//let passport = require('passport');
//var session = require('express-session');
//let authenticate = require('../authenticate');

const User = require('../models/user_db');

const signRouter = express.Router();
      signRouter.use(bodyParser.json());


 let sessionChecker = (req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
      res.redirect('/');
  } else {
      next();
  }    
};

signRouter.get('/',sessionChecker, function(req, res, next) {
  res.render('index', { title: 'Express' });
});
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

signRouter
.post('/login', (req, res, next) => {

  if(!req.session.user) {
    User.findOne({where:{name: req.body.name,},})
    .then((user) => {
      if (user === null) {
        var err = new Error('User ' + req.body.name + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if (user.pass !== req.body.pass) {
        var err = new Error('Your password is incorrect!');
        err.status = 403;
        return next(err);
      }
      else if (user.name === req.body.name && user.pass === req.body.pass) {
        req.session.user = 'authenticated';
        res.cookie('uid',req.body.name , { httpOnly: true });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated!')
      } 
    })
    .catch((err) => next(err));
  }
  else {
   // console.log( req.cookies['uid']);
  //  req.session.user = user.dataValues;
   // console.dir(req.cookies['session-id']);
   //   console.log(req.session.user);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
})



signRouter
.post('/signUp',sessionChecker, (req, res, next) => {
    User.findOne({where:{name: req.body.name,},})
      .then((user) => {
        if(user != null) {
          let err = new Error('User ' + req.body.name + ' already exists!');
          err.status = 403;
          next(err);
        }
        else {
        return  User.findOne({where:{email: req.body.email,},})
           .then((email)=> {
              if(email != null) {
                let err = new Error('This email: ' + req.body.email + ' already exists!');
                console.log("Email error LOgger")
                err.status = 403;
                 next(err);
              }else{
                  return User.create({
                  name: req.body.name,
                  pass: req.body.pass,
                  email: req.body.email
                  })
               }
            })
         }
    })
      .then((user) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
        // req.session.user = user.dataValues;
        //  res.cookie('uid',req.body.name , { httpOnly: true });
          res.json({status: 'Registration Successful!', user: user});
      }, (err) => next(err))
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

