const db = require("../config/db");

exports.dashboard = async (req,res)=>{

const [data] = await db.execute(`

SELECT

COUNT(*) total_tasks,

SUM(status='Completed') completed,

SUM(deadline < NOW()) overdue

FROM tasks

`);

res.json(data[0]);

};