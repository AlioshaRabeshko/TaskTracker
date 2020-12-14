
const { Sequelize, Model, DataTypes } = require('sequelize');
module.exports = {dao_conn : new Sequelize("postgres", "postgres", "admin", {
    dialect: "postgres",
    host: "localhost",
    port: "5432"
  })};

  