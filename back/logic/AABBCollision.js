const { Sequelize } = require('sequelize');
const TimeFormatter = require('./timeFormatting');
const Task = require('./models/task_db');

let tasksLeft = null;
let tasksRight = null;

function getCollidingNum(uid, deadline, wholeTime) {
  // change to async
  Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      raw: true,
      bestStartTime: {
        [Sequelize.Op.gte]: deadline - wholeTime,
        deadline: { [Sequelize.Op.lte]: deadline },
      },
    },
  })
    .then((tasks) => tasks.length)
    .catch((err) => console.error(err));
}

function getAllTasks(uid, deadline) {
  // change to async method
  Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      raw: true,
      deadline: { [Sequelize.Op.lte]: deadline },
    },
    order: [['deadline', 'INC']],
  })
    .then((tasks) => {
      tasksLeft = tasks;
    })
    .catch((err) => console.error(err));

  Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      raw: true,
      deadline: { [Sequelize.Op.gt]: deadline },
    },
    order: [['deadline', 'INC']],
  })
    .then((tasks) => {
      tasksRight = tasks;
    })
    .catch((err) => console.error(err));
}

export default function checkTime(
  uid,
  deadline,
  initialTime,
  additionalTime,
  priority
) {
  let wholeTime =
    TimeFormatter.toNormalTime(initialTime) +
    TimeFormatter.toNormalTime(additionalTime);
  getCollidingNum(uid, deadline, wholeTime).then((collNum) => {
    if (collNum === 0) {
      return deadline - wholeTime;
    } else {
      getAllTasks(uid, deadline).then(() => {
        let availableTime = deadline - Date.now(); //divide by number of working hours
        let leftTime = 0;
        tasksLeft.forEach((task) => {
          leftTime +=
            TimeFormatter.toNormalTime(task.initialTime) +
            TimeFormatter.toNormalTime(task.additionalTime) -
            TimeFormatter.toNormalTime(task.executionTime);
        });
        const realDeadline = deadline - tasksRight[0].bestStartTime;

        if (realDeadline < 0) {
          realDeadline = 0;
        }

        if (availableTime - leftTime > wholeTime + realDeadline) {
          const { lastLeftDeadline, leftArr } = reduceShiftScopeLeft(
            tasksLeft,
            wholeTime,
            availableTime
          );
          return leftShift(leftArr, lastLeftDeadline);
        } else if (
          0 < availableTime - leftTime &&
          availableTime - leftTime < wholeTime + realDeadline
        ) {
          const { overdueTime, leftArr } = findLowPriorityLeft(
            tasksLeft,
            wholeTime,
            availableTime,
            priority
          );
          const bstCurrent = leftShift(leftArr, null);
          if (overdueTime > 0 && realDeadline > 0) {
            //check for ability of right shift
            const { overdueTime, rightArr, changed } = checkForRightShift(
              tasksRight,
              overdueTime,
              priority
            );
            if (changed === 1) {
              Task.update(
                {
                  bestStartTime: rightArr[0].bestStartTime,
                  additionalTime: rightArr[0].additionalTime,
                },
                {
                  where: {
                    uid: rightArr[0].uid,
                  },
                }
              ).catch((err) => console.error(err));
            } else if (changed > 1) {
              overdueTime = rightShift(
                rightArr,
                overdueTime,
                changed,
                priority,
                deadline,
                realDeadline
              );
            }
          }
          //print delay message
          console.dir('expected overdue: ' + overdueTime);
          return bstCurrent; // change to normal work hours
        } else {
          // add as is, print error message
          console.dir('not enough time');
          return deadline - wholeTime; // change to normal work hours
        }
      });
    }
  });
}

function leftShift(leftArr, lastLeftDeadline) {
  // null if we shift all
  leftArr.forEach((task) => {
    if (lastLeftDeadline === null) {
      task.bestStartTime = Date.now();
    } else if (task.bestStartTime > lastLeftDeadline) {
      task.bestStartTime = lastLeftDeadline;
    }

    lastLeftDeadline =
      task.bestStartTime +
      TimeFormatter.toNormalTime(task.initialTime) +
      TimeFormatter.toNormalTime(task.additionalTime) -
      TimeFormatter.toNormalTime(task.executionTime); // change to normal work hours
    //push changes, mb add method to
    Task.update(
      {
        bestStartTime: task.bestStartTime,
        additionalTime: task.additionalTime,
      },
      {
        where: {
          uid: task.uid,
        },
      }
    ).catch((err) => console.error(err));
  });
  return lastLeftDeadline;
}

function reduceShiftScopeLeft(leftArr, wholeTime, availableTime) {
  availableTime += Date.now();
  lastLeftDeadline = null;
  leftArr.forEach((task) => {
    availableTime -=
      this.bestStartTime +
      TimeFormatter.toNormalTime(task.initialTime) +
      TimeFormatter.toNormalTime(task.additionalTime) -
      TimeFormatter.toNormalTime(task.executionTime); // change to normal work hours
    return wholeTime >= availableTime
      ? leftArr.shift()
      : { lastLeftDeadline, leftArr };
  });
}

function findLowPriorityLeft(
  leftArr,
  wholeTime,
  availableTime,
  currentPriority
) {
  let overdueTime = wholeTime - availableTime;
  leftArr.forEach((task) => {
    if (currentPriority > task.priority) {
      const additionalDifference = TimeFormatter.toNormalTime(
        task.additionalTime / 10
      );
      task.additionalTime = TimeFormatter.toTimeString(
        TimeFormatter.toNormalTime(task.additionalTime) - additionalDifference
      );
      overdueTime -= additionalDifference;
      if (overdueTime <= 0) {
        break;
      }
    }
  });
  return { overdueTime, leftArr };
}

function checkForRightShift(
  rightArr,
  overdueTime,
  currentPriority,
  deadline,
  realDeadline
) {
  //check if can be shifted or if any additional time can be reduced
  if (
    rightArr[0].deadline -
      TimeFormatter.toNormalTime(rightArr[0].initialTime) -
      TimeFormatter.toNormalTime(rightArr[0].additionalTime) >
    rightArr[0].bestStartTime
  ) {
    //should iterate to determine if shift is possible, also reduce additional time if needed
    //first  iterate to find unshiftable(one with deadline - initial -additional == bst)
    let toChange = 0;
    rightArr.forEach((task) => {
      if (
        task.deadline -
          TimeFormatter.toNormalTime(task.initialTime) -
          TimeFormatter.toNormalTime(task.additionalTime) <=
        task.bestStartTime
      ) {
        if (task.priority < currentPriority) {
          task.additionalTime = TimeFormatter.toTimeString(
            TimeFormatter.toNormalTime(task.additionalTime) -
              TimeFormatter.toNormalTime(task.additionalTime / 10)
          );
          toChange++;
        }
        break;
      } else {
        toChange++;
      }
    });

    return { overdueTime, rightArr, changed: toChange };
  } else {
    //cannot shift, can only check first for additional time reduce
    if (rightArr[0].priority < currentPriority) {
      const additionalDifference = TimeFormatter.toNormalTime(
        rightArr[0].additionalTime / 10
      );
      rightArr[0].additionalTime = TimeFormatter.toTimeString(
        TimeFormatter.toNormalTime(rightArr[0].additionalTime) -
          additionalDifference
      );
      rightArr[0].bestStartTime -= additionalDifference;
      overdueTime -= Math.max(
        Math.min(
          realDeadline - rightArr[0].bestStartTime,
          deadline - rightArr[0].bestStartTime
        ),
        0
      );
      return { overdueTime, rightArr, changed: 1 };
    } else {
      return { overdueTime, rightArr, changed: 0 };
    }
  }
}

function rightShift(
  rightArr,
  overdueTime,
  changed,
  currentPriority,
  deadline,
  realDeadline
) {
  //idk how to use priority here properly,should shift, change priority and shift again mb
  let lastRightBst = Number.MAXSAFEINTEGER;
  for (let i = changed - 1; i >= 0; i--) {
    rightArr[i].bestStartTime = Math.min(
      rightArr[i].deadline -
        TimeFormatter.toNormalTime(rightArr[i].initialTime) -
        TimeFormatter.toNormalTime(rightArr[i].additionalTime),
      lastRightBst
    );
    lastRightBst = rightArr[i].bestStartTime;
  }
  if (deadline > rightArr[0].bestStartTime) {
    rightArr.forEach((task) => {
      if (task.priority < currentPriority) {
        let additionalDifference = TimeFormatter.toNormalTime(
          task.additionalTime / 10
        );
        task.additionalTime = TimeFormatter.toTimeString(
          TimeFormatter.toNormalTime(task.additionalTime) - additionalDifference
        );
        task.bestStartTime -= additionalDifference;
      }
    });
  }
  lastRightBst = Number.MAXSAFEINTEGER;
  for (let i = changed - 1; i >= 0; i--) {
    rightArr[i].bestStartTime = Math.min(
      rightArr[i].deadline -
        TimeFormatter.toNormalTime(rightArr[i].initialTime) -
        TimeFormatter.toNormalTime(rightArr[i].additionalTime),
      lastRightBst
    );
    lastRightBst = rightArr[i].bestStartTime;
    Task.update(
      {
        bestStartTime: rightArr[i].bestStartTime,
        additionalTime: rightArr[i].additionalTime,
      },
      {
        where: {
          uid: rightArr[i].uid,
        },
      }
    ).catch((err) => console.error(err));
  }

  overdueTime -= Math.max(
    Math.min(
      realDeadline - rightArr[0].bestStartTime,
      deadline - rightArr[0].bestStartTime
    ),
    0
  );
  return overdueTime;
}
