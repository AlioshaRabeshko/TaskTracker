
const { Sequelize, Model, DataTypes } = require('sequelize');
module.exports = {dao_conn : new Sequelize("postgres", "postgres", "1111", {
    dialect: "postgres",
    host: "localhost",
    port: "5432"
  })};

  