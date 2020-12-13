
const { Sequelize, Model, DataTypes } = require('sequelize');
const Task = require('./models/task_db')
const TF = require('./time_formatting').TimeFormatter
const CH = require('./coefficient_handler').CoeffitientHandler
const AABBCollisionCheck = require('./AABBCollision').default
let startTimestamp
class TaskMock{
    constructor( uid,name, description, deadline, priority, difficulty,initial_time){
        this.uid = uid
        this.name = name
        this.description = description
        this.deadline = deadline
        this.priority = priority
        this.difficulty = difficulty
        this.initial_time = initial_time
        this.additional_Time = null
        this.executionTime = "00:00:00"
        this.best_start_time = null
        this.state = "pending"
    }

    

    async countAdditionalTime(){
        let whole_time = this.deadline - Date.now()
        let  required_time
        let  initial_time_int = TF.toNormalTime(this.initial_time)
        let coef = 0.1
        if((whole_time - initial_time_int) <= 0) {
            required_time = null
            console.dir("not enough time") // change to smth that works, mb redirect to separate corresponding page
            return;
        }   
        coef =  await CH.getDifficultyCoefficient(this.difficulty,this.uid)

        required_time = initial_time_int*coef
                if((required_time+initial_time_int)>whole_time){
                    required_time = this.deadline - Date.now() - initial_time_int;
                 }
                 this.additional_Time = TF.toTimeString(required_time)
        
    }

    
    startTask(){
        startTimestamp = Date.now()
    }

    pauseTask(){
        console.dir(this.executionTime)
        this.executionTime = TF.toTimeString( Date.now() - startTimestamp)
        console.dir(this.executionTime)
        this.updateTaskExecutionTime()
    }

    endTask(){
        this.executionTime = TF.toTimeString( Date.now() - startTimestamp)
        this.state = "done"
        this.updateTaskExecutionTime()
    }

    async countBestStartTime(){
        try{

            if(this.additional_Time === null){
                await this.countAdditionalTime()
            }
            let initial_bst = (this.deadline - (TF.toNormalTime(this.initial_time)+TF.toNormalTime(this.additional_Time))) // change to 8 hours a day or smth
            
                    AABBCollisionCheck(this.uid,this.deadline,this.initial_time,this.additional_Time,this.priority).then(
                        bst =>{
                            this.bst = bst
                            this.addTask()
                        } )
                    
        }catch(err){console.error(err)}

    }

    //push task to database

    addTask(){
        Task.create({
            uid: this.uid,
            name:this.name,
            description:this.description,
            deadline:new Date(this.deadline).toISOString(),
            best_start_time:new Date(this.best_start_time).toISOString(),
            initial_time:this.initial_time,
            additional_time:this.additional_Time,
            execution_time:this.executionTime,
            priority:this.priority,
            difficulty:this.difficulty,
            state:this.state
          }).catch(err=>console.error(err));
    }

    updateTaskExecutionTime(){
        
        Task.update({ 
            execution_time: this.executionTime,
        state: this.state }, {
            where: {
              uid: this.uid
            }
          }).catch(err=>console.error(err))
    }

    updateTaskBST(){
        Task.update({ 
            best_start_time: this.best_start_time}, {
            where: {
              uid: this.uid
            }
          }).catch(err=>console.error(err))
    }

    

}

module.exports = {
    TaskMock: TaskMock
}

    