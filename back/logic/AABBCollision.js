const {Sequelize, Model, DataTypes} = require('sequelize');
const Task = require('./models/task');
const TF = require('./timeFormatting').TimeFormatter;

async function getCollidingNum(uid, deadline, initial_bst) {
  const tasks1 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      [Sequelize.Op.or]: [
        //1st
        {
          best_start_time: {
            [Sequelize.Op.lte]: initial_bst,
          },

          deadline: {
            [Sequelize.Op.lte]: deadline,
            [Sequelize.Op.gte]: initial_bst,
          },
        },
        //2nd
        {
          best_start_time: {
            [Sequelize.Op.gte]: initial_bst,
            [Sequelize.Op.lte]: deadline,
          },

          deadline: {
            [Sequelize.Op.gte]: deadline,
          },
        },
        //3rd
        {
          best_start_time: {
            [Sequelize.Op.gte]: initial_bst,
            [Sequelize.Op.lte]: deadline,
          },

          deadline: {
            [Sequelize.Op.lte]: deadline,
            [Sequelize.Op.gte]: initial_bst,
          },
        },
        //4th
        {
          best_start_time: {
            [Sequelize.Op.lte]: initial_bst,
          },

          deadline: {
            [Sequelize.Op.gte]: deadline,
          },
        },
      ],
    },
  });

  return tasks1.length;
}

async function getCollidingNumEx(uid, deadline, initial_bst, task_id) {
  // change to async
  const tasks1 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      [Sequelize.Op.or]: [
        //1st
        {
          best_start_time: {
            [Sequelize.Op.lte]: initial_bst,
          },

          deadline: {
            [Sequelize.Op.lte]: deadline,
            [Sequelize.Op.gte]: initial_bst,
          },
        },
        //2nd
        {
          best_start_time: {
            [Sequelize.Op.gte]: initial_bst,
            [Sequelize.Op.lte]: deadline,
          },

          deadline: {
            [Sequelize.Op.gte]: deadline,
          },
        },
        //3rd
        {
          best_start_time: {
            [Sequelize.Op.gte]: initial_bst,
            [Sequelize.Op.lte]: deadline,
          },

          deadline: {
            [Sequelize.Op.lte]: deadline,
            [Sequelize.Op.gte]: initial_bst,
          },
        },
        //4th
        {
          best_start_time: {
            [Sequelize.Op.lte]: initial_bst,
          },

          deadline: {
            [Sequelize.Op.gte]: deadline,
          },
        },
      ],

      id: {
        [Sequelize.Op.ne]: task_id,
      },
    },
  });

  return tasks1.length;
}

async function getAllTasks(uid, deadline) {
  const tasks1 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: { [Sequelize.Op.lte]: deadline },
    },
    order: [['deadline', 'ASC']],
  });

  const tasks2 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: { [Sequelize.Op.gt]: deadline },
    },
    order: [['deadline', 'ASC']],
  });
  return [tasks1, tasks2];
}

async function getAllTasksEx(uid, deadline, task_id = null) {
  const tasks1 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: { [Sequelize.Op.lte]: deadline },
      id: { [Sequelize.Op.ne]: task_id },
    },
    order: [['deadline', 'ASC']],
  });

  const tasks2 = await Task.findAll({
    where: {
      state: 'pending',
      uid: uid,
      deadline: { [Sequelize.Op.gt]: deadline },
      id: { [Sequelize.Op.ne]: task_id },
    },
    order: [['deadline', 'ASC']],
  });
  return [tasks1, tasks2];
}
// exported function (to find it faster)
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
  const initial_bst_colliding = getTimeNoCollisions(deadline, whole_time);
  if (task_id === null) {
    collNum = await getCollidingNum(uid, deadline, initial_bst_colliding);
  } else {
    collNum = await getCollidingNumEx(
      uid,
      deadline,
      initial_bst_colliding,
      task_id
    );
  }

  if (collNum === 0) {
    let time = getTimeNoCollisions(deadline, whole_time);
    return time;
  } else {
    if (task_id === null) {
      [tasks_left, tasks_right] = await getAllTasks(uid, deadline);
    } else {
      [tasks_left, tasks_right] = await getAllTasksEx(uid, deadline, task_id);
    }
    let available_time = getAvailableTime(deadline);
    let left_time = 0;
    for (task of tasks_left) {
      left_time +=
        TF.toNormalTime(task.initial_time) +
        TF.toNormalTime(task.additional_time) -
        TF.toNormalTime(task.execution_time);
    }

    let real_deadline = 0;
    if (tasks_right.length != 0) {
      real_deadline = subtractNonWorking(
        deadline - tasks_right[0].best_start_time
      ); // subtract non-working hours
    }
    if (real_deadline < 0) {
      real_deadline = 0;
    }
    if (available_time - left_time > whole_time + real_deadline) {
      if (tasks_left.length === 0) {
        return normalWorkHoursRight(tasks_right, deadline, whole_time);
      } else {
        return normalWorkHoursLeft(tasks_left, whole_time);
      }
    } else if (
      0 < available_time - left_time &&
      available_time - left_time < whole_time + real_deadline
    ) {
      let overdue_time, left_arr;
      let bst_left, bst_right;
      if (tasks_left.length != 0) {
        [overdue_time, left_arr] = findLowPriorityLeft(
          tasks_left,
          whole_time,
          available_time,
          priority
        );

        bst_left = normalWorkHoursLeft(left_arr, whole_time);
      }
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
                id: right_arr[0].id,
              },
            }
          ).catch((err) => console.error(err));
        } else if (changed > 1) {
          bst_right = normalWorkHoursRight(right_arr, deadline, whole_time);
        }
      }
      //print delay message
      console.dir('expected overdue: ' + bst_right - bst_left);
      return bst_current; // change to normal work hours
    } else {
      // add as is, print error message
      console.dir('not enough time for bst');
      return getTimeNoCollisions(bst_left, whole_time); // change to normal work hours
    }
  }
};

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
      return { overdue_time, right_arr, changed: 1 };
    } else {
      return { overdue_time, right_arr, changed: 0 };
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
          id: right_arr[i].id,
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

function normalWorkHoursLeft(
  left_arr,
  whole_time_current,
  work_hours_left = '09:00:00',
  work_hours_right = '18:00:00'
) {
  const work_hours_left_int = TF.toNormalTime(work_hours_left);
  const work_hours_right_int = TF.toNormalTime(work_hours_right);
  const work_hours =
    TF.toNormalTime('24:00:00') - (work_hours_right_int - work_hours_left_int);
  let lastLeftDeadline = Date.now(); // we should check if it cn be shrunken afterwards
  for (task of left_arr) {
    let task_hours =
      TF.toNormalTime(task.initial_time) +
      TF.toNormalTime(task.additional_time) -
      TF.toNormalTime(task.execution_time);
    //add bst here(should shift it once at start)
    const date_initial_int = TF.toNormalTime(
      new Date(lastLeftDeadline).toLocaleString().split(', ')[1]
    );
    if (
      date_initial_int >= work_hours_left_int &&
      date_initial_int <= work_hours_right_int
    ) {
    } else if (date_initial_int >= work_hours_right_int) {
      lastLeftDeadline +=
        work_hours - (date_initial_int - work_hours_right_int);
    } else {
      lastLeftDeadline += work_hours_left_int - date_initial_int;
    }
    task.best_start_time = lastLeftDeadline;

    while (task_hours > 0) {
      const date_int = TF.toNormalTime(
        new Date(lastLeftDeadline).toLocaleString().split(', ')[1]
      );

      if (date_int >= work_hours_left_int && date_int <= work_hours_right_int) {
        const subtract = Math.min(task_hours, work_hours_right_int - date_int);
        task_hours -= subtract;
        lastLeftDeadline += subtract;
      } else if (date_int >= work_hours_right_int) {
        lastLeftDeadline += work_hours - (date_int - work_hours_right_int);
      } else {
        lastLeftDeadline += work_hours_left_int - date_int;
      }
    }

    Task.update(
      {
        best_start_time: task.best_start_time,
        additional_time: task.additional_time,
      },
      {
        where: {
          uid: task.uid,
          id: task.id,
        },
      }
    ).catch((err) => console.error(err));
  }

  return lastLeftDeadline;
}

function normalWorkHoursRight(
  right_arr,
  deadline,
  whole_time_current,
  work_hours_left = '09:00:00',
  work_hours_right = '18:00:00'
) {
  const work_hours_left_int = TF.toNormalTime(work_hours_left);
  const work_hours_right_int = TF.toNormalTime(work_hours_right);
  const work_hours =
    TF.toNormalTime('24:00:00') - (work_hours_right_int - work_hours_left_int);
  let lastRightBST;

  right_arr.reverse();
  if (right_arr.length != 0) {
    lastRightBST = Date.parse(right_arr[right_arr.length - 1].deadline);
  } else {
    lastRightBST = deadline;
  }
  for (task of right_arr) {
    lastRightBST = Math.min(lastRightBST, task.deadline);
    let task_hours =
      TF.toNormalTime(task.initial_time) +
      TF.toNormalTime(task.additional_time) -
      TF.toNormalTime(task.execution_time);

    while (task_hours > 0) {
      // do the same for the current
      const date_int = TF.toNormalTime(
        new Date(lastRightBST).toLocaleString().split(', ')[1]
      );
      if (date_int >= work_hours_left_int && date_int <= work_hours_right_int) {
        const subtract = Math.min(task_hours, date_int - work_hours_left_int);
        task_hours -= subtract;

        lastRightBST -= subtract;
      } else if (date_int <= work_hours_left_int) {
        lastRightBST -= work_hours + (date_int - work_hours_left_int);
      } else {
        lastRightBST += work_hours_right_int - date_int;
      }
    }
    task.best_start_time = lastRightBST; // new deadline for the element
    Task.update(
      {
        best_start_time: task.best_start_time,
        additional_time: task.additional_time,
      },
      {
        where: {
          uid: task.uid,
          id: task.id,
        },
      }
    ).catch((err) => console.error(err));
  }

  while (whole_time_current > 0) {
    // do the same for the current
    const date_int = TF.toNormalTime(
      new Date(lastRightBST).toLocaleString().split(', ')[1]
    );
    if (date_int >= work_hours_left_int && date_int <= work_hours_right_int) {
      const subtract = Math.min(
        whole_time_current,
        date_int - work_hours_left_int
      );
      whole_time_current -= subtract;

      lastRightBST -= subtract;
    } else if (date_int <= work_hours_left_int) {
      lastRightBST -= work_hours + (date_int - work_hours_left_int);
    } else {
      lastRightBST += work_hours_right_int - date_int;
    }
  }

  return lastRightBST;
}

function getAvailableTime(
  deadline,
  work_hours_left = '09:00:00',
  work_hours_right = '18:00:00'
) {
  const work_hours_left_int = TF.toNormalTime(work_hours_left);
  const work_hours_right_int = TF.toNormalTime(work_hours_right);
  const date_initial_int = TF.toNormalTime(
    new Date(Date.now()).toLocaleString().split(', ')[1]
  );
  if (
    date_initial_int >= work_hours_left_int &&
    date_initial_int <= work_hours_right_int
  ) {
    return (
      work_hours_right_int -
      date_initial_int +
      (((deadline - date_initial_int) % (24 * 3600000)) - 1) *
        (work_hours_right_int - work_hours_left_int)
    );
  } else if (date_initial_int >= work_hours_right_int) {
    return (
      (((deadline - date_initial_int) % (24 * 3600000)) - 1) *
      (work_hours_right_int - work_hours_left_int)
    );
  } else {
    return (
      ((deadline - date_initial_int) % (24 * 3600000)) *
      (work_hours_right_int - work_hours_left_int)
    );
  }
}

function getTimeNoCollisions(
  deadline,
  task_hours,
  work_hours_left = '09:00:00',
  work_hours_right = '18:00:00'
) {
  const work_hours_left_int = TF.toNormalTime(work_hours_left);
  const work_hours_right_int = TF.toNormalTime(work_hours_right);
  const work_hours =
    TF.toNormalTime('24:00:00') - (work_hours_right_int - work_hours_left_int);
  let lastRightBST = deadline;
  while (task_hours > 0) {
    const date_int = TF.toNormalTime(
      new Date(lastRightBST).toLocaleString().split(', ')[1]
    );
    if (date_int >= work_hours_left_int && date_int <= work_hours_right_int) {
      const subtract = Math.min(task_hours, date_int - work_hours_left_int);
      task_hours -= subtract;
      lastRightBST -= subtract;
    } else if (date_int <= work_hours_left_int) {
      lastRightBST -= work_hours + (date_int - work_hours_left_int);
    } else {
      lastRightBST += work_hours_right_int - date_int;
    }
  }
  return lastRightBST;
}

function subtractNonWorking(
  time,
  work_hours_left = '09:00:00',
  work_hours_right = '18:00:00'
) {
  const work_time =
    TF.toNormalTime(work_hours_right) - TF.toNormalTime(work_hours_left);
  const days = time % (24 * 60 * 60 * 1000);
  return days * work_time + time - days * (24 * 60 * 60 * 1000); //will get rough assumption
}
