const express = require('express');
const bodyParser = require('body-parser').json();
const TaskMock = require('../logic/taskHandler');
const addTaskRouter = express.Router();
addTaskRouter.use(bodyParser);

function convertMinToHour(num) {
	const hours = Math.floor(num / 60);
	const minutes = num % 60;
	return hours + ':' + minutes + ':00';
}

addTaskRouter.post('/', (req, res, error) => {
	const { name, description, date, ttd, priority, difficulty } = req.body;
	const task = new TaskMock(
		req.cookies['uid'],
		name,
		description,
		date.split('T').join(' ') + ':00.000+02',
		convertMinToHour(ttd),
		priority,
		difficulty
	)
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
