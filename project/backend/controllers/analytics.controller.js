const db = require("../config/db");

exports.dashboard = async (req,res)=>{

const [data] = await db.execute(`

SELECT

COUNT(*) total_tasks,

SUM(status='completed') completed,

SUM(deadline < NOW() AND status != 'completed') overdue

FROM tasks

`);

const [users] = await db.execute(`

SELECT COUNT(*) active_users FROM users WHERE active=1

`);

const result = data[0];
result.completed_percent = result.total_tasks > 0 ? (result.completed / result.total_tasks * 100).toFixed(1) : 0;
result.active_users = users[0].active_users;

res.json(result);

};