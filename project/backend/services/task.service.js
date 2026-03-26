const eventService =
require("./event.service");

exports.taskCreatedEvent =
async(task,user)=>{

  await eventService.logEvent({

    type:"TASK_CREATED",

    userId:task.assigned_to,

    taskId:task.task_id

  });

};