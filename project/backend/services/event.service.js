const db = require("../config/db");
const { getIO } = require("../config/socket");
const { v4: uuid } = require("uuid");

exports.logEvent = async ({ type, userId, taskId }) => {
  const eventId = uuid();

  await db.execute(
    `INSERT INTO events(event_id,event_type,user_id,task_id)
     VALUES (?,?,?,?)`,
    [eventId, type, userId, taskId]
  );

  const io = getIO();

  io.to(userId).emit("eventUpdate", {
    eventId,
    type,
    taskId
  });
};