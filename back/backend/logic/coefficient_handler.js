const { Sequelize, Model, DataTypes } = require('sequelize');
const conn = require('./models/dao');
const Task = require('./models/task_db');
const Coefficient = require('./models/coefficient_db');
const TimeFormatter = require('./time_formatting').TimeFormatter;

class CoeffitientHandler {
  failure = null;
  new_coef = null;

  static async getLastFiveDone(uid, difficulty) {
    try {
      let tasks = await Task.findAll(
        // we gonna do update based only on 5 of the most recent ones
        {
          limit: 5,
          where: { state: 'done', uid: uid, difficulty: difficulty },
          order: [['updatedAt', 'DESC']],
        }
      );

      return tasks;
    } catch (err) {
      console.error(err);
    }
  }

  static async coeffitientUpdate(difficulty, uid) {
    try {
      let last_five = await CoeffitientHandler.getLastFiveDone(uid, difficulty);
      console.dir(last_five);
      if (last_five.length >= 5) {
        let delta_coefficient = 0;
        last_five.forEach((task) => {
          delta_coefficient +=
            (TimeFormatter.toNormalTime(task.execution_time) -
              (TimeFormatter.toNormalTime(task.initial_time) +
                TimeFormatter.toNormalTime(task.additional_time))) /
            (TimeFormatter.toNormalTime(task.initial_time) +
              TimeFormatter.toNormalTime(task.additional_time)); // getting fraction compaared to original time
        });
        delta_coefficient /= 5;
        console.dir(delta_coefficient);
        if (delta_coefficient > 0) {
          // deciding if we should update lower difficulties or higher
          this.new_coef = await Coefficient.findAll({
            where: { difficulty: { [Sequelize.Op.gte]: difficulty }, uid: uid },
          });
        } else {
          this.new_coef = await Coefficient.findAll({
            where: { difficulty: { [Sequelize.Op.lte]: difficulty }, uid: uid },
          });
        }

        this.new_coef.forEach((coefficient) => {
          // maybe should check if it's not greater than the initial one ( though it will lead to reduction of time)
          coefficient.coefficient += delta_coefficient;
          Coefficient.update(
            {
              coefficient: coefficient.coefficient,
            },
            {
              where: {
                uid: coefficient.uid,
                difficulty: coefficient.difficulty,
              },
            }
          );
        });

        last_five.forEach((task) => {
          task.state = 'used';
          Task.update(
            {
              state: task.state,
            },
            {
              where: {
                uid: task.uid,
                id: task.id,
              },
            }
          );
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  static async initializeCoefficientEntries(uid) {
    // use right after user creation
    const coefficient_step = 0.03;

    for (let i = 1; i <= 10; i++) {
      try {
        await Coefficient.create({
          uid: uid,
          difficulty: i,
          coefficient: coefficient_step * i,
        });
      } catch (err) {
        console.error(err);
      }
    }
    return 1;
  }

  static async getDifficultyCoefficient(difficulty, uid) {
    // used when calculating additional time
    try {
      let coefficient = await Coefficient.findOne({
        where: { difficulty: difficulty, uid: uid },
      });
      return coefficient.coefficient;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = {
  CoeffitientHandler: CoeffitientHandler,
};
