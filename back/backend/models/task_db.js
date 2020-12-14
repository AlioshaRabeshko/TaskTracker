const { type } = require('os');
const { Sequelize, Model, DataTypes } = require('sequelize');
const conn = require('./dao').dao_conn;

class Task extends Model {}
Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uid: {
      type: DataTypes.INTEGER,
      model: 'users',
      key: 'id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    best_start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    initial_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    additional_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    execution_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: conn,
    modelName: 'task',
  }
);
//conn.sync().catch(err=> console.error(err));

module.exports = Task;
