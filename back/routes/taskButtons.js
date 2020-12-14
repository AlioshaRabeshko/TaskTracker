const express = require('express');
const bodyParser = require('body-parser').json();
const taskHandler = require('../logic/taskHandler').TaskMock;

const taskButtonRouter = express.Router();
taskButtonRouter.use(bodyParser);

taskButtonRouter.get('/startTask', (req, res, next) => {
  const data = taskHandler.startTask(req.task.id);
  res.cookie(req.task.id + '', data, {httpOnly: true});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
});

taskButtonRouter.get('/endTask', (req, res, next) => {
  if (req.task.id + '') {
    taskHandler.endTask(req.task.id, req.user.id, req.cookie[req.task.id + '']);
    res.clearCookie(req.task.id + '');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  } else {
    const err = new Error('First you have to start task');
    err.status = 403;
    next(err);
  }
});

taskButtonRouter.get('/pauseTask', (req, res, next) => {
  if (req.task.id + '') {
    taskHandler.pauseTask(
      req.task.id,
      req.user.id,
      req.cookie[req.task.id + '']
    );
    res.clearCookie(req.task.id + '');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  } else {
    const err = new Error('First you have to start task');
    err.status = 403;
    next(err);
  }
});

module.exports = taskButtonRouter;
