const db = require("../config/db");

exports.heatmap = async (req,res)=>{

const [rows] = await db.execute(`

SELECT
DATE(timestamp) day,
COUNT(*) intensity

FROM events

GROUP BY day

`);

res.json(rows);

};