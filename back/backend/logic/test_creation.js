const User = require('./models/user_db');
const TaskMock = require('./task_handler').TaskMock;
const CH = require('./coefficient_handler').CoeffitientHandler;
const conn = require('./models/dao').dao_conn;

let name = 'Adam';
let pass = 'for81Dden4Ru1T';
let email = 'adam_the_first@mail.my';
let uid = null;
let tsk = null;

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
  await CH.initializeCoefficientEntries(uid);
  const tsk = new TaskMock(
    uid,
    'stuff',
    'do stuff',
    Date.parse('2020-12-14 23:59:20.059+02'),
    5,
    4,
    '00:28:00'
  );
  await tsk.countBestStartTime();
  const tsk2 = new TaskMock(
    uid,
    'stuff',
    'do stuff',
    Date.parse('2020-12-14 22:39:20.059+02'),
    5,
    4,
    '00:31:00'
  );
  await tsk2.countBestStartTime();

  const tsk3 = new TaskMock(
    uid,
    'stuff',
    'do stuff',
    Date.parse('2020-12-14 21:50:20.059+02'),
    5,
    4,
    '00:15:00'
  );
  await tsk3.countBestStartTime();
  let tsk1_t = tsk.startTask(1); // will know from called task
  setTimeout(() => {
    tsk.pauseTask(1, tsk1_t);
    console.dir(tsk);
  }, 3000);

  setTimeout(() => {
    TaskMock.updateTaskSwitch(
      1,
      tsk.uid,
      'other stuff',
      tsk.description,
      tsk.deadline,
      tsk.priority,
      tsk.difficulty,
      '0:21:00',
      tsk.additional_Time,
      '00:10:00',
      tsk.best_start_time,
      tsk.state
    );
  }, 60000);
}

try {
  testAsync();
} catch (err) {
  console.dir(err);
}
