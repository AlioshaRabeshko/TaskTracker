
const { type } = require('os');
const { Sequelize, Model, DataTypes } = require('sequelize');
const conn = require('./dao').dao_conn;

class Coefficient extends Model{}
Coefficient.init({
    id:{
        type: DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    uid:{
        type: DataTypes.INTEGER,
        model: 'users', 
        key: 'id'
    },
    difficulty:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    coefficient:{
        type: DataTypes.FLOAT,
        allowNull:true
    }



},
{
    sequelize:conn,
    modelName:'coefficient',
    timestamps: false
}
);

//conn.sync().catch(err=> console.error(err));

module.exports = Coefficient