

const User = require('./models/user_db')
const TaskMock = require('./task_handler').TaskMock
const CH = require('./coefficient_handler').CoeffitientHandler
const conn = require('./models/dao').dao_conn;

let name = "Adam"
let pass = "for81Dden4Ru1T"
let email = "adam_the_first@mail.my"
let uid = null
let tsk=null

async function testAsync(){
    await conn.sync({force:true}).catch(err=> console.error(err));

    await User.create({
        name:name,
        pass:pass,
        email:email
    
    })
        await User.findOne({where:{name: name, pass: pass, email:email,},}).then(user=> uid = user.id)
        await CH.initializeCoefficientEntries(uid)
         let tsk = new TaskMock(uid,'stuff','do stuff',Date.now()+10000000000,5,4,'00:28:00')
         await tsk.countBestStartTime()
        console.dir(tsk)
        tsk.startTask()
        setTimeout(()=>{
            tsk.pauseTask()
            console.dir(tsk)}, 3000)

        
}


try{
testAsync()
}catch(err){
    console.dir(err)
}


