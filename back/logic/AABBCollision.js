const {Sequelize, Model, DataTypes} = require('sequelize');
const Task = require('./models/task');
const TF = require('./timeFormatting').TimeFormatter;

async function getCollidingNum(uid, deadline, whole_time) {
  // change to async
  const tasks = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      best_start_time: {
        [Sequelize.Op.gte]: deadline - whole_time,
        [Sequelize.Op.lte]: deadline,
      },
      deadline: {
        [Sequelize.Op.lte]: deadline,
        [Sequelize.Op.gte]: deadline - whole_time,
      },
    },
  });

  return tasks.length;
}

async function getCollidingNum(uid, deadline, whole_time, task_id) {
  // change to async
  const tasks = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      best_start_time: {
        [Sequelize.Op.gte]: deadline - whole_time,
        [Sequelize.Op.lte]: deadline,
      },
      deadline: {
        [Sequelize.Op.lte]: deadline,
        [Sequelize.Op.gte]: deadline - whole_time,
      },
      id: {
        [Sequelize.Op.ne]: task_id,
      },
    },
  });

  return tasks.length;
}

async function getAllTasks(uid, deadline) {
  // change to async method

  const tasks1 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: {[Sequelize.Op.lte]: deadline},
    },
    order: [['deadline', 'ASC']],
  });

  const tasks2 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: {[Sequelize.Op.gt]: deadline},
    },
    order: [['deadline', 'ASC']],
  });
  return [tasks1, tasks2];
}

async function getAllTasks(uid, deadline, task_id) {
  const tasks1 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: {[Sequelize.Op.lte]: deadline},
      id: {[Sequelize.Op.ne]: task_id},
    },
    order: [['deadline', 'ASC']],
  });

  const tasks2 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: {[Sequelize.Op.gt]: deadline},
      id: {[Sequelize.Op.ne]: task_id},
    },
    order: [['deadline', 'ASC']],
  });
  return [tasks1, tasks2];
}

module.exports.check_time = async function check_time(
  uid,
  deadline,
  initial_time,
  additional_time,
  execution_time = '00:00:00',
  priority,
  task_id = null
) {
  let whole_time =
    TF.toNormalTime(initial_time) + TF.toNormalTime(additional_time);
  if (execution_time != '00:00:00') {
    // had to put it in here due to update possibility
    whole_time -= TF.toNormalTime(execution_time);
  }
  let collNum;
  if (task_id === null) {
    collNum = await getCollidingNum(uid, deadline, whole_time);
  } else {
    collNum = await getCollidingNum(uid, deadline, whole_time, task_id);
  }
  if (collNum === 0) {
    return deadline - whole_time;
  } else {
    if (task_id === null) {
      [tasks_left, tasks_right] = await getAllTasks(uid, deadline);
    } else {
      [tasks_left, tasks_right] = await getAllTasks(uid, deadline, task_id);
    }
    let available_time = deadline - Date.now(); //divide by number of working hours
    let left_time = 0;
    for (task of tasks_left) {
      left_time +=
        TF.toNormalTime(task.initial_time) +
        TF.toNormalTime(task.additional_time) -
        TF.toNormalTime(task.execution_time);
    }

    let real_deadline = 0;
    if (tasks_right.length != 0) {
      real_deadline = deadline - tasks_right[0].best_start_time;
    }
    if (real_deadline < 0) {
      real_deadline = 0;
    }
    if (available_time - left_time > whole_time + real_deadline) {
      /* let lastLeftDeadline, left_arr;
      [lastLeftDeadline, left_arr] = reduceShiftScopeLeft(
        tasks_left,
        whole_time,
        available_time
      );
      console.dir(lastLeftDeadline);*/
      return leftShift(tasks_left, null /*left_arr, lastLeftDeadline*/);
    } else if (
      0 < available_time - left_time &&
      available_time - left_time < whole_time + real_deadline
    ) {
      let overdue_time, left_arr;
      [overdue_time, left_arr] = findLowPriorityLeft(
        tasks_left,
        whole_time,
        available_time,
        priority
      );

      let bst_current = leftShift(left_arr, null);
      if (overdue_time > 0 && real_deadline > 0) {
        //check for ability of right shift
        let changed = 0;
        let right_arr = null;
        [overdue_time, right_arr, changed] = checkForRightShift(
          tasks_right,
          overdue_time,
          priority
        );
        if (changed === 1) {
          Task.update(
            {
              best_start_time: right_arr[0].best_start_time,
              additional_time: right_arr[0].additional_time,
            },
            {
              where: {
                uid: right_arr[0].uid,
              },
            }
          ).catch((err) => console.error(err));
        } else if (changed > 1) {
          overdue_time = rightShift(
            right_arr,
            overdue_time,
            changed,
            priority,
            deadline,
            real_deadline
          );
        }
      }
      //print delay message
      console.dir('expected overdue: ' + overdue_time);
      return bst_current; // change to normal work hours
    } else {
      // add as is, print error message
      console.dir('not enough time');
      return deadline - whole_time; // change to normal work hours
    }
  }
};

function leftShift(left_arr, lastLeftDeadline) {
  // null if we shift all
  for (task of left_arr) {
    if (lastLeftDeadline === null) {
      task.best_start_time = Date.now();
    } else if (task.best_start_time > lastLeftDeadline) {
      task.best_start_time = lastLeftDeadline;
    }

    lastLeftDeadline =
      Date.parse(task.best_start_time) +
      TF.toNormalTime(task.initial_time) +
      TF.toNormalTime(task.additional_time) -
      TF.toNormalTime(task.execution_time); // change to normal work hours
    //push changes, mb add method to
    Task.update(
      {
        best_start_time: task.best_start_time,
        additional_time: task.additional_time,
      },
      {
        where: {
          uid: task.uid,
        },
      }
    ).catch((err) => console.error(err));
  }
  return lastLeftDeadline;
}

function reduceShiftScopeLeft(left_arr, whole_time, available_time) {
  available_time += Date.now();
  lastLeftDeadline = null;
  for (task of left_arr) {
    lastLeftDeadline =
      task.best_start_time +
      TF.toNormalTime(task.initial_time) +
      TF.toNormalTime(task.additional_time) -
      TF.toNormalTime(task.execution_time);
    available_time -= lastLeftDeadline; // change to normal work hours
    if (whole_time >= available_time) {
      left_arr.shift();
    } else {
      return [lastLeftDeadline, left_arr];
    }
  }
  return [lastLeftDeadline, left_arr];
}

function findLowPriorityLeft(
  left_arr,
  whole_time,
  available_time,
  current_priority
) {
  let overdue_time = whole_time - available_time;
  for (task of left_arr) {
    if (current_priority > task.priority) {
      let additional_difference = TF.toNormalTime(task.additional_time / 10);
      task.additional_time = TF.toTimeString(
        TF.toNormalTime(task.additional_time) - additional_difference
      );
      overdue_time -= additional_difference;
      if (overdue_time <= 0) {
        break;
      }
    }
  }
  return [overdue_time, left_arr];
}

function checkForRightShift(
  right_arr,
  overdue_time,
  current_priority,
  deadline,
  real_deadline
) {
  //check if can be shifted or if any additional time can be reduced
  if (
    right_arr[0].deadline -
      TF.toNormalTime(right_arr[0].initial_time) -
      TF.toNormalTime(right_arr[0].additional_time) >
    right_arr[0].best_start_time
  ) {
    //should iterate to determine if shift is possible, also reduce additional time if needed
    //first  iterate to find unshiftable(one with deadline - initial -additional == bst)
    let to_change = 0;
    for (task of right_arr) {
      if (
        task.deadline -
          TF.toNormalTime(task.initial_time) -
          TF.toNormalTime(task.additional_time) <=
        task.best_start_time
      ) {
        if (task.priority < current_priority) {
          task.additional_time = TF.toTimeString(
            TF.toNormalTime(task.additional_time) -
              TF.toNormalTime(task.additional_time / 10)
          );
          to_change++;
        }
        break;
      } else {
        to_change++;
      }
    }

    return [overdue_time, right_arr, to_change];
  } else {
    //cannot shift, can only check first for additional time reduce
    if (right_arr[0].priority < current_priority) {
      let additional_difference = TF.toNormalTime(
        right_arr[0].additional_time / 10
      );
      right_arr[0].additional_time = TF.toTimeString(
        TF.toNormalTime(right_arr[0].additional_time) - additional_difference
      );
      right_arr[0].best_start_time -= additional_difference;
      overdue_time -= Math.max(
        Math.min(
          real_deadline - right_arr[0].best_start_time,
          deadline - right_arr[0].best_start_time
        ),
        0
      );
      return {overdue_time, right_arr, changed: 1};
    } else {
      return {overdue_time, right_arr, changed: 0};
    }
  }
}

function rightShift(
  right_arr,
  overdue_time,
  changed,
  current_priority,
  deadline,
  real_deadline
) {
  //idk how to use priority here properly,should shift, change priority and shift again mb
  let lastRightBst = Number.MAX_SAFE_INTEGER;
  for (let i = changed - 1; i >= 0; i--) {
    right_arr[i].best_start_time = Math.min(
      right_arr[i].deadline -
        TF.toNormalTime(right_arr[i].initial_time) -
        TF.toNormalTime(right_arr[i].additional_time),
      lastRightBst
    );
    lastRightBst = right_arr[i].best_start_time;
  }
  if (deadline > right_arr[0].best_start_time) {
    for (task of right_arr) {
      if (task.priority < current_priority) {
        let additional_difference = TF.toNormalTime(task.additional_time / 10);
        task.additional_time = TF.toTimeString(
          TF.toNormalTime(task.additional_time) - additional_difference
        );
        task.best_start_time -= additional_difference;
      }
    }
  }
  lastRightBst = Number.MAX_SAFE_INTEGER;
  for (let i = changed - 1; i >= 0; i--) {
    right_arr[i].best_start_time = Math.min(
      right_arr[i].deadline -
        TF.toNormalTime(right_arr[i].initial_time) -
        TF.toNormalTime(right_arr[i].additional_time),
      lastRightBst
    );
    lastRightBst = right_arr[i].best_start_time;
    Task.update(
      {
        best_start_time: right_arr[i].best_start_time,
        additional_time: right_arr[i].additional_time,
      },
      {
        where: {
          uid: right_arr[i].uid,
        },
      }
    ).catch((err) => console.error(err));
  }

  overdue_time -= Math.max(
    Math.min(
      real_deadline - right_arr[0].best_start_time,
      deadline - right_arr[0].best_start_time
    ),
    0
  );
  return overdue_time;
}
