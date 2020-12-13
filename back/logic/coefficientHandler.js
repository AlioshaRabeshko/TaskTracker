const { Sequelize } = require('sequelize');
const Coefficient = require('./models/coefficient_db');
const TimeFormatter = require('./timeFormatting');
const Task = require('./models/task_db');

class CoeffitientHandler {
  failure = null;
  newCoef = null;

  static async getLastFiveDone(uid, difficulty) {
    try {
      const tasks = await Task.findAll(
        // we gonna do update based only on 5 of the most recent ones
        {
          limit: 5,
          where: { state: 'done', uid: uid, difficulty: difficulty },
          order: [['updatedAt', 'DESC']],
          raw: true,
        }
      );

      return tasks;
    } catch (err) {
      console.error(err);
    }
  }

  static async coeffitientUpdate(difficulty, uid) {
    try {
      lastFive = await getLastFiveDone(difficulty, uid);
      if (lastFive.length === 5) {
        let deltaCoefficient = 0;
        lastFive.forEach((task) => {
          deltaCoefficient +=
            (TimeFormatter.toNormalTime(task.executionTime) -
              (TimeFormatter.toNormalTime(task.initialTime) +
                TimeFormatter.toNormalTime(task.additionalTime))) /
            (TimeFormatter.toNormalTime(task.initialTime) +
              TimeFormatter.toNormalTime(task.additionalTime)); // getting fraction compaared to original time
        });
        deltaCoefficient /= 5;
        if (deltaCoefficient > 0) {
          // deciding if we should update lower difficulties or higher
          this.newCoef = await Coefficient.findAll({
            where: { difficulty: { [Sequelize.Op.gte]: difficulty }, uid: uid },
          });
        } else {
          this.newCoef = await Coefficient.findAll({
            where: { difficulty: { [Sequelize.Op.lte]: difficulty } },
          });
        }

        this.newCoef.forEach((coefficient) => {
          // maybe should check if it's not greater than the initial one ( though it will lead to reduction of time)
          coefficient.coefficient += deltaCoefficient;
          coefficient.save().catch((err) => console.error(err)); // can move to other place if desired
        });

        lastFive.forEach((task) => {
          task.state = 'used';
          task.save().catch((err) => console.error(err));
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  static async initializeCoefficientEntries(uid) {
    // use right after user creation
    const coefficientStep = 0.03;

    for (let i = 1; i <= 10; i++) {
      try {
        await Coefficient.create({
          uid: uid,
          difficulty: i,
          coefficient: coefficientStep * i,
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
      console.dir(coefficient);
      return coefficient.coefficient;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = CoeffitientHandler;
