const { Model, DataTypes } = require('sequelize');
const db = require('./dao');

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
			allowNull: true,
		},
		execution_time: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		priority: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {min:1, max:10},
			
		},
		difficulty: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {min:1, max:10},
		},
		state: {
			type: DataTypes.STRING,
			allowNull: true,
		},
	},
	{
		sequelize: db,
		modelName: 'task',
	}
);
//conn.sync().catch(err=> console.error(err));

module.exports = Task;
