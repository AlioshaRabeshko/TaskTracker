let express = require('express');
const bodyParser = require('body-parser');
//let passport = require('passport');

//let authenticate = require('../authenticate');
const Task = require('../models/task_db');

const addTaskRouter = express.Router();
      addTaskRouter.use(bodyParser.json());

      addTaskRouter.post('/', (req, res, next) => {
      return   Task.create({
              uid: req.cookies['uid'],
              name: req.body.             name,
              description: req.body.      description,
              deadline: req.body.         deadline,
              best_start_time: req.body.  best_start_time,
              initial_time: req.body.     initial_time,
              additional_time: req.body.  additional_time,
              execution_time: req.body.   execution_time,
              priority: req.body.         priority,
              difficulty: req.body.       difficulty,
              state: req. body.           state
   
          })
        .then((user) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({status: 'Registration Successful!', task: task});
        }, (err) => next(err))
        .catch((err) => next(err));
  });
  

  
module.exports = addTaskRouter;