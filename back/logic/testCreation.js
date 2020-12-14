const User = require('./models/user');
const TaskMock = require('./taskHandler');
const CoeffitientHandler = require('./coefficientHandler');
const conn = require('./models/dao');

const name = 'Adam';
const pass = 'for81Dden4Ru1T';
const email = 'adam_the_first@mail.my';
const uid = null;

async function testAsync() {
	await conn.sync({ force: true }).catch((err) => console.error(err));

	await User.create({
		name: name,
		pass: pass,
		email: email,
	});

	await User.findOne({ where: { name: name, pass: pass, email: email } }).then(
		(user) => (uid = user.id)
	);

	await CoeffitientHandler.initializeCoefficientEntries(uid);
	const tsk = new TaskMock(
		uid,
		'stuff',
		'do stuff',
		Date.now() + 10000000000,
		5,
		4,
		'00:28:00'
	);

	await tsk.countBestStartTime();
	//   console.dir(tsk);
	tsk.startTask();
	setTimeout(() => tsk.pauseTask(), 3000);
	// console.dir(tsk);
}

try {
	testAsync();
} catch (err) {
	console.error(err);
}
