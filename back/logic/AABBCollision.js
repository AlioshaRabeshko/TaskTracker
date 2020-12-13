
const { Sequelize, Model, DataTypes } = require('sequelize');
const Task = require('./models/task_db')
const TF = require('./time_formatting').TimeFormatter

let tasks_left = null
let tasks_right = null

function getCollidingNum(uid,deadline,whole_time){ // change to async
     Task.findAll({
        where:{state: "pending", uid: uid, raw: true, best_start_time:{[Sequelize.Op.gte]:deadline-whole_time,
            deadline:{[Sequelize.Op.lte]:deadline}} } })
        .then(tasks=>{
            return tasks.length
        }).catch(err=>console.error(err))
}

function getAllTasks(uid,deadline){ // change to async method

    Task.findAll({
            where:{state: "pending", uid: uid, raw: true, deadline:{[Sequelize.Op.lte]:deadline} },order:[ [ 'deadline', 'INC' ]] })
            .then(tasks=>{
                tasks_left = tasks
            }).catch(err=>console.error(err))

    Task.findAll({
                where:{state: "pending", uid: uid, raw: true, deadline:{[Sequelize.Op.gt]:deadline} }, order:[ [ 'deadline', 'INC' ]] })
                .then(tasks=>{
                    tasks_right = tasks
                }).catch(err=>console.error(err))
    
}

export default function check_time(uid, deadline, initial_time, additional_time,priority){
    let whole_time = TF.toNormalTime(initial_time)+TF.toNormalTime(additional_time)
    getCollidingNum(uid,deadline,whole_time).then(collNum =>{
        if(collNum == 0){
            return deadline-whole_time
        }else{ 
            getAllTasks(uid,deadline).then(
                sth=>{
                    let available_time = deadline - Date.now() //divide by number of working hours
            let left_time =0
            tasks_left.forEach(task => {
                left_time += (TF.toNormalTime(task.initial_time)+TF.toNormalTime(task.additional_time) - TF.toNormalTime(task.execution_time))
            });
            let real_deadline = deadline - tasks_right[0].best_start_time
        
            if(real_deadline<0){
                real_deadline = 0
            }
        
            if(available_time - left_time > whole_time+real_deadline ){
                   let lastLeftDeadline,left_arr
                   (lastLeftDeadline,left_arr) = reduceShiftScopeLeft(tasks_left,whole_time,available_time)
                   return leftShift(left_arr,lastLeftDeadline)
        
            }else if( 0<available_time - left_time && available_time - left_time<whole_time+real_deadline){
                let overdue_time,left_arr
                (overdue_time,left_arr) = findLowPriorityLeft(tasks_left,whole_time,available_time,priority)
                let bst_current = leftShift(left_arr,null)
                if(overdue_time>0&&real_deadline>0){
                    //check for ability of right shift
                    let changed = 0
                    let right_arr = null
                    (overdue_time,right_arr,changed) =checkForRightShift(tasks_right,overdue_time,priority)
                    if(changed === 1){
                        Task.update({ 
                            best_start_time: right_arr[0].best_start_time,
                            additional_time: right_arr[0].additional_time }, {
                            where: {
                              uid: right_arr[0].uid
                            }
                          }).catch(err=>console.error(err))
                    }else if(changed > 1){
                        overdue_time =  rightShift(right_arr,overdue_time,changed,priority,deadline,real_deadline)
                        
                    }
                }
                //print delay message
                console.dir("expected overdue: "+overdue_time)
                return bst_current // change to normal work hours
            }else{
                // add as is, print error message
                console.dir("not enough time")
                return deadline-whole_time // change to normal work hours
            }
            })
            
        }
    })
    
}

function leftShift(left_arr,lastLeftDeadline){ // null if we shift all
    left_arr.forEach(task=> {
        if(lastLeftDeadline===null){
            task.best_start_time = Date.now()
        }else if( task.best_start_time>lastLeftDeadline){
            task.best_start_time = lastLeftDeadline
        }
        
        lastLeftDeadline = task.best_start_time + TF.toNormalTime(task.initial_time)+TF.toNormalTime(task.additional_time) - TF.toNormalTime(task.execution_time) // change to normal work hours
        //push changes, mb add method to 
        Task.update({ 
            best_start_time: task.best_start_time,
            additional_time: task.additional_time }, {
            where: {
              uid: task.uid
            }
          }).catch(err=>console.error(err))
    });
    return lastLeftDeadline
}

function reduceShiftScopeLeft(left_arr,whole_time,available_time){
    available_time += Date.now()
    lastLeftDeadline = null
    left_arr.forEach(task=> {
        available_time -= (this.best_start_time + TF.toNormalTime(task.initial_time)+TF.toNormalTime(task.additional_time) - TF.toNormalTime(task.execution_time)) // change to normal work hours
        if(whole_time>=available_time){
            left_arr.shift()
        }else{
            return {lastLeftDeadline,left_arr}
        }
    })
}

function findLowPriorityLeft(left_arr,whole_time,available_time,current_priority){
    let overdue_time = whole_time - available_time
    left_arr.forEach(task=>{
        if(current_priority > task.priority){
            let additional_difference = TF.toNormalTime(task.additional_time/10)
            task.additional_time = TF.toTimeString(TF.toNormalTime(task.additional_time) - additional_difference)
            overdue_time -= additional_difference
            if( overdue_time<=0){
                break
            }
        }
    })
    return {overdue_time,left_arr}
}

function checkForRightShift(right_arr, overdue_time,current_priority,deadline,real_deadline){
    //check if can be shifted or if any additional time can be reduced
    if(right_arr[0].deadline-TF.toNormalTime(right_arr[0].initial_time)-TF.toNormalTime(right_arr[0].additional_time) 
     > right_arr[0].best_start_time){
        //should iterate to determine if shift is possible, also reduce additional time if needed
        //first  iterate to find unshiftable(one with deadline - initial -additional == bst)
        let to_change = 0
        right_arr.forEach(task=>{
            if(task.deadline-TF.toNormalTime(task.initial_time)-TF.toNormalTime(task.additional_time)  <= task.best_start_time){
                if(task.priority < current_priority){
                    task.additional_time = TF.toTimeString(TF.toNormalTime(task.additional_time) - TF.toNormalTime(task.additional_time/10))
                    to_change++
                }
                break
            }else{
                to_change++
            }
        })
        
        return{overdue_time,right_arr,changed:to_change}
    }else{
        //cannot shift, can only check first for additional time reduce 
        if(right_arr[0].priority < current_priority){
            let additional_difference = TF.toNormalTime(right_arr[0].additional_time/10)
            right_arr[0].additional_time = TF.toTimeString(TF.toNormalTime(right_arr[0].additional_time) - additional_difference)
            right_arr[0].best_start_time -=additional_difference 
            overdue_time -= Math.max(Math.min(real_deadline - right_arr[0].best_start_time,deadline - right_arr[0].best_start_time),0)
            return {overdue_time,right_arr,changed:1}
        }else{
            return {overdue_time,right_arr,changed:0}
        }
    }
}

function rightShift(right_arr,overdue_time,changed, current_priority,deadline,real_deadline){ //idk how to use priority here properly,should shift, change priority and shift again mb
    let lastRightBst = Number.MAX_SAFE_INTEGER
    for(let i = changed-1; i>=0; i--){
        right_arr[i].best_start_time = Math.min(right_arr[i].deadline - TF.toNormalTime(right_arr[i].initial_time)
        -TF.toNormalTime(right_arr[i].additional_time),lastRightBst)
        lastRightBst = right_arr[i].best_start_time
    }
    if(deadline > right_arr[0].best_start_time){
        right_arr.forEach(task => {
            if(task.priority<current_priority){
                let additional_difference = TF.toNormalTime(task.additional_time/10)
            task.additional_time = TF.toTimeString(TF.toNormalTime(task.additional_time) - additional_difference)
            task.best_start_time -=additional_difference 
            }
        })
    }
    lastRightBst = Number.MAX_SAFE_INTEGER
    for(let i = changed-1; i>=0; i--){
        right_arr[i].best_start_time = Math.min(right_arr[i].deadline - TF.toNormalTime(right_arr[i].initial_time)
        -TF.toNormalTime(right_arr[i].additional_time),lastRightBst)
        lastRightBst = right_arr[i].best_start_time
        Task.update({ 
            best_start_time: right_arr[i].best_start_time,
            additional_time: right_arr[i].additional_time }, {
            where: {
              uid: right_arr[i].uid
            }
          }).catch(err=>console.error(err))
    }

    
    overdue_time -= Math.max(Math.min(real_deadline - right_arr[0].best_start_time,deadline - right_arr[0].best_start_time),0)
    return overdue_time
}