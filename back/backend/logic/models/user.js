const { Model, DataTypes } = require('sequelize');
const Task = require('./task');
const Coefficient = require('./coefficient');
const db = require('./dao');

class User extends Model {}
User.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		pass: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize: db,
		modelName: 'user',
		timestamps: false,
	}
);

User.hasMany(Task, { as: 'Task', foreignKey: 'uid', onDelete: 'cascade' });
User.hasMany(Coefficient, {
	as: 'Coeficient',
	foreignKey: 'uid',
	onDelete: 'cascade',
});

module.exports = User;
