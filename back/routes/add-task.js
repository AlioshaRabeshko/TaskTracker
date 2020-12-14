const express = require('express');
const bodyParser = require('body-parser').json();
const {TaskMock} = require('../logic/taskHandler');
const addTaskRouter = express.Router();
addTaskRouter.use(bodyParser);

addTaskRouter.post('/', (req, res, error) => {
  const {name, description, date, ttd, priority, difficulty} = req.body;
  const task = new TaskMock(
    req.cookies['uid'],
    name,
    description,
    //  Date.parse('2020-12-14 22:39:20.059+02'),
    date.split('T').join(' ') + ':00.000+02',
    priority,
    difficulty,
    convertMinToHour(ttd)
  );
  console.dir(task);
  task
    .countBestStartTime()
    .then(() => {
      res.setHeader('Content-Type', 'application/json');
      res.json({status: 'Task added!', task: task});
    })
    .catch((err) => {
      error(err);
      res.sendStatus(400);
    });
});

module.exports = addTaskRouter;
