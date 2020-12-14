const express = require('express');
const bodyParser = require('body-parser').json();
const TaskMock = require('../logic/taskHandler');
const addTaskRouter = express.Router();
addTaskRouter.use(bodyParser);

addTaskRouter.post('/', (req, res, error) => {
	const {
		name,
		description,
		deadline,
		initialTime,
		priority,
		difficulty,
		state,
	} = req.body;
	const task = new TaskMock({
		uid: req.cookies['uid'],
		name: name,
		description: description,
		deadline: deadline,
		initialTime: initialTime,
		priority: priority,
		difficulty: difficulty,
		state: state,
	})
		.then(() => {
			task.countBestStartTime();
			res.setHeader('Content-Type', 'application/json');
			res.json({ status: 'Registration Successful!', task: task });
		})
		.catch((err) => {
			error(err);
			res.sendStatus(400);
		});
});

module.exports = addTaskRouter;
