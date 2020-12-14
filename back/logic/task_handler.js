const { Sequelize, Model, DataTypes } = require('sequelize');
const Task = require('./models/task_db');
const TF = require('./time_formatting').TimeFormatter;
const CH = require('./coefficient_handler').CoeffitientHandler;
const AABBCollisionCheck = require('./AABBCollision').check_time;
class TaskMock {
  constructor(
    uid,
    name,
    description,
    deadline,
    priority,
    difficulty,
    initial_time
  ) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.deadline = deadline;
    this.priority = priority;
    this.difficulty = difficulty;
    this.initial_time = initial_time;
    this.additional_Time = '00:00:00';
    this.executionTime = '00:00:00';
    this.best_start_time = null;
    this.state = 'pending';
  }

  async countAdditionalTime() {
    let whole_time = this.deadline - Date.now();
    let required_time;
    let initial_time_int = TF.toNormalTime(this.initial_time);
    let coef = 0.1;
    if (whole_time <= initial_time_int) {
      required_time = '00:00:00';
      console.dir('not enough time'); // change to smth that works, mb redirect to separate corresponding page
      return;
    }
    coef = await CH.getDifficultyCoefficient(this.difficulty, this.uid);
    required_time = initial_time_int * coef;

    if (required_time + initial_time_int > whole_time) {
      console.dir('additional time reduced');
      required_time = this.deadline - Date.now() - initial_time_int;
    }
    this.additional_Time = TF.toTimeString(required_time);
  }

  startTask(task_id) {
    return Date.now(); //save to session or cookies, mb return object "task_id":Date.now()
  }

  pauseTask(task_id, startTimestamp) {
    this.executionTime = TF.toTimeString(Date.now() - startTimestamp);
    this.updateTaskExecutionTime(task_id);
  }

  endTask(task_id, startTimestamp) {
    this.executionTime = TF.toTimeString(Date.now() - startTimestamp);
    this.state = 'done';
    this.updateTaskExecutionTime(task_id);
  }

  async countBestStartTime(task_id = null) {
    try {
      if (this.additional_Time == '00:00:00' || task_id != null) {
        await this.countAdditionalTime();
      }
      let initial_bst =
        this.deadline -
        (TF.toNormalTime(this.initial_time) +
          TF.toNormalTime(this.additional_Time)); // change to 8 hours a day or smth

      let bst = await AABBCollisionCheck(
        this.uid,
        this.deadline,
        this.initial_time,
        this.additional_Time,
        this.executionTime,
        this.priority,
        task_id
      );

      this.best_start_time = bst;
      if (this.executionTime === '00:00:00') {
        this.addTask();
      }
    } catch (err) {
      console.error(err);
    }
  }

  //push task to database

  addTask() {
    Task.create({
      uid: this.uid,
      name: this.name,
      description: this.description,
      deadline: new Date(this.deadline).toISOString(),
      best_start_time: new Date(this.best_start_time).toISOString(),
      initial_time: this.initial_time,
      additional_time: this.additional_Time,
      execution_time: this.executionTime,
      priority: this.priority,
      difficulty: this.difficulty,
      state: this.state,
    }).catch((err) => console.error(err));
  }

  updateTaskExecutionTime(task_id) {
    Task.update(
      {
        execution_time: this.executionTime,
        state: this.state,
      },
      {
        where: {
          uid: this.uid,
          id: task_id,
        },
      }
    ).catch((err) => console.error(err));
  }

  updateTaskBST() {
    Task.update(
      {
        best_start_time: this.best_start_time,
      },
      {
        where: {
          uid: this.uid,
        },
      }
    ).catch((err) => console.error(err));
  }

  static async updateTaskSwitch(
    id,
    uid,
    name,
    description,
    deadline,
    priority,
    difficulty,
    initial_time,
    additional_time,
    execution_time,
    best_start_time,
    state
  ) {
    try {
      let initial_values = await Task.findOne({
        where: {
          state: 'pending',
          uid: uid,
          id: id,
        },
      });

      if (
        initial_values.deadline != deadline ||
        initial_values.initial_time != initial_time ||
        initial_values.difficulty != difficulty
      ) {
        const temp = new TaskMock(
          uid,
          name,
          description,
          deadline,
          priority,
          difficulty,
          initial_time
        );
        temp.executionTime = execution_time;
        await temp.countBestStartTime(id);
        console.dir(temp);
        Task.update(
          {
            name: temp.name,
            description: temp.description,
            deadline: temp.deadline,
            priority: temp.priority,
            difficulty: temp.difficulty,
            initial_time: temp.initial_time,
            additional_time: temp.additional_time,
            execution_time: temp.execution_time,
            best_start_time: temp.best_start_time,
            state: temp.state,
          },
          {
            where: {
              uid: this.uid,
              id: task_id,
            },
          }
        );
      } else {
        Task.update(
          {
            name: name,
            description: description,
            priority: priority,
            execution_time: execution_time,
            state: state,
          },
          {
            where: {
              uid: this.uid,
              id: task_id,
            },
          }
        );
      }
    } catch (err) {}
  }
}

module.exports = {
  TaskMock: TaskMock,
};
