const express = require('express');
const bodyParser = require('body-parser').json();

const Task = require('../models/task');
const taskListRouter = express.Router();
taskListRouter.use(bodyParser);

taskListRouter.get('/', (req, res) => {
	Task.findAll({
		order: [['deadline', 'INC']],
	})
		.then((tasks) => {
			res.send(tasks).status(200);
		})
		.catch((err) => console.error(err));
});
