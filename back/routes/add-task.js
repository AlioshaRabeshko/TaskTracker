const express = require('express');
const bodyParser = require('body-parser').json();
const {TaskMock} = require('../logic/taskHandler');
const addTaskRouter = express.Router();
addTaskRouter.use(bodyParser);

function convertMinToHour(num) {
  const hours = Math.floor(num / 60);
  const minutes = num % 60;
  return hours + ':' + minutes + ':00';
}

addTaskRouter.post('/', (req, res, error) => {
  const {name, description, date, ttd, priority, difficulty} = req.body;
  console.dir(req.body.date);
  const task = new TaskMock(
    req.cookies['uid'],
    name,
    description,
    //Date.parse('2020-12-14 22:39:20.059+02'),
    Date.parse(date.split('T').join(' ') + ':00.000+02'),
    priority,
    difficulty,
    convertMinToHour(ttd)
  );
  //console.dir(task);
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
