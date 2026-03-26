const db = require("../config/db");

exports.createEvent = async (event) => {

  return db.execute(`
    INSERT INTO events
    (event_id,event_type,user_id,task_id)
    VALUES (?,?,?,?)
  `,[
    event.event_id,
    event.event_type,
    event.user_id,
    event.task_id
  ]);

};

exports.getEvents = async () => {

  const [rows] = await db.execute(`
    SELECT * FROM events
    ORDER BY timestamp DESC
  `);

  return rows;

};