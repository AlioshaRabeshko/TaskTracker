

const { Sequelize, Model, DataTypes } = require('sequelize');
const conn = require('./models/dao')
const Task = require('./models/task_db')
const Coefficient = require('./models/coefficient_db')
const TimeFormatter = require('./time_formatting').TimeFormatter

class CoeffitientHandler{
    failure = null
    new_coef = null



   static async getLastFiveDone(uid,difficulty){
    try{   
    let tasks =  awaitTask.findAll( // we gonna do update based only on 5 of the most recent ones
            {
                limit: 5,
                where:{state: "done", uid: uid, difficulty:difficulty,}, order:[ [ 'updatedAt', 'DESC' ]], raw: true },
            )
    
     return tasks
    }catch(err){console.error(err)};
    }

    static async coeffitientUpdate(difficulty, uid){
        try{
        last_five = await getLastFiveDone(difficulty, uid)
        if(last_five.length === 5){
            let delta_coefficient = 0
            last_five.forEach(task => {
                delta_coefficient += (TimeFormatter.toNormalTime(task.execution_time) - 
                    (TimeFormatter.toNormalTime(task.initial_time) + TimeFormatter.toNormalTime(task.additional_time)))
                    /(TimeFormatter.toNormalTime(task.initial_time) + TimeFormatter.toNormalTime(task.additional_time))// getting fraction compaared to original time
            });
            delta_coefficient /=5
            if(delta_coefficient>0){ // deciding if we should update lower difficulties or higher
                this.new_coef = await Coefficient.findAll({
                    where:{difficulty:{[Sequelize.Op.gte]:difficulty},uid: uid,},
                })
            }else{
                this.new_coef = await Coefficient.findAll({
                    where:{difficulty:{[Sequelize.Op.lte]:difficulty},},
                })
            }

            this.new_coef.forEach(coefficient => { // maybe should check if it's not greater than the initial one ( though it will lead to reduction of time)
                coefficient.coefficient += delta_coefficient
                coefficient.save().catch(err=> console.error(err)) // can move to other place if desired
            })

            last_five.forEach(task =>{
                task.state = "used"
                task.save().catch(err=> console.error(err))
            })
        }
    }catch(err){console.error(err)}

    }

    static async initializeCoefficientEntries(uid){ // use right after user creation
        const coefficient_step = 0.03

        for(let i=1; i<=10; i++){
            try{
                await  Coefficient.create({
                     uid: uid,
                     difficulty:i,
                     coefficient: coefficient_step*i
                 })

            }catch(err) {console.error(err)}
        }
        return 1
    }

    static async getDifficultyCoefficient(difficulty,uid){ // used when calculating additional time
        try{
            let coefficient = await Coefficient.findOne({
                where:{difficulty:difficulty,uid: uid,},
            })
                console.dir(coefficient)
                return coefficient.coefficient

        }catch(err) {console.error(err)}
    }
}

module.exports = {
    CoeffitientHandler:CoeffitientHandler
}