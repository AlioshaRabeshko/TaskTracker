const Sequelize = require('sequelize');

module.exports = new Sequelize('postgres', 'postgres', 'admin', {
	dialect: 'postgres',
	host: 'localhost',
	port: '5432',
	logging: false,
});
