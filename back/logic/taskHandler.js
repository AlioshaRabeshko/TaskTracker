const Task = require('./models/task_db');
const TimeFormatter = require('./timeFormatting');
const CoeffitientHandler = require('./coefficientHandler');
const AABBCollisionCheck = require('./AABBCollision');

let startTimestamp;

class TaskMock {
  constructor(
    uid,
    name,
    description,
    deadline,
    priority,
    difficulty,
    initialTime
  ) {
    this.uid = uid;
    this.name = name;
    this.description = description;
    this.deadline = deadline;
    this.priority = priority;
    this.difficulty = difficulty;
    this.initialTime = initialTime;
    this.additionalTime = null;
    this.executionTime = '00:00:00';
    this.bestStartTime = null;
    this.state = 'pending';
  }

  async countAdditionalTime() {
    let wholeTime = this.deadline - Date.now();
    let requiredTime;
    let initialTimeInt = TimeFormatter.toNormalTime(this.initialTime);
    let coef = 0.1;
    if (wholeTime - initialTimeInt <= 0) {
      requiredTime = null;
      console.dir('not enough time'); // change to smth that works, mb redirect to separate corresponding page
      return;
    }
    coef = await CoeffitientHandler.getDifficultyCoefficient(
      this.difficulty,
      this.uid
    );

    requiredTime = initialTimeInt * coef;
    if (requiredTime + initialTimeInt > wholeTime) {
      requiredTime = this.deadline - Date.now() - initialTimeInt;
    }
    this.additionalTime = TimeFormatter.toTimeString(requiredTime);
  }

  startTask() {
    startTimestamp = Date.now();
  }

  pauseTask() {
    console.dir(this.executionTime);
    this.executionTime = TimeFormatter.toTimeString(
      Date.now() - startTimestamp
    );
    console.dir(this.executionTime);
    this.updateTaskExecutionTime();
  }

  endTask() {
    this.executionTime = TimeFormatter.toTimeString(
      Date.now() - startTimestamp
    );
    this.state = 'done';
    this.updateTaskExecutionTime();
  }

  async countBestStartTime() {
    try {
      if (this.additionalTime === null) {
        await this.countAdditionalTime();
      }
      let initialBst =
        this.deadline -
        (TimeFormatter.toNormalTime(this.initialTime) +
          TimeFormatter.toNormalTime(this.additionalTime)); // change to 8 hours a day or smth

      AABBCollisionCheck(
        this.uid,
        this.deadline,
        this.initialTime,
        this.additionalTime,
        this.priority
      ).then((bst) => {
        this.bst = bst;
        this.addTask();
      });
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
      bestStartTime: new Date(this.bestStartTime).toISOString(),
      initialTime: this.initialTime,
      additionalTime: this.additionalTime,
      executionTime: this.executionTime,
      priority: this.priority,
      difficulty: this.difficulty,
      state: this.state,
    }).catch((err) => console.error(err));
  }

  updateTaskExecutionTime() {
    Task.update(
      {
        executionTime: this.executionTime,
        state: this.state,
      },
      {
        where: {
          uid: this.uid,
        },
      }
    ).catch((err) => console.error(err));
  }

  updateTaskBST() {
    Task.update(
      {
        bestStartTime: this.bestStartTime,
      },
      {
        where: {
          uid: this.uid,
        },
      }
    ).catch((err) => console.error(err));
  }
}

module.exports = TaskMock;
