const express = require('express');
const bodyParser = require('body-parser').json();

const Task = require('../logic/models/task');

const taskListRouter = express.Router();
taskListRouter.use(bodyParser);

taskListRouter.get('/', (req, res) => {
  Task.findAll({
    where: {
      //uid: req.cookies['uid'],
      uid: 40,
    },
    order: [['deadline', 'ASC']],
  })
    .then((tasks) => {
      res.send(tasks).status(200);
    })
    .catch((err) => console.error(err));
});

module.exports = taskListRouter;
