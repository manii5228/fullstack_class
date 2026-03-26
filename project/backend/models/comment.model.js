const db = require("../config/db");

exports.addComment = async (taskId,userId,text) => {

  return db.execute(`
    INSERT INTO comments(task_id,user_id,comment_text)
    VALUES(?,?,?)
  `,[taskId,userId,text]);
};

exports.getComments = async (taskId) => {

  const [rows] = await db.execute(`
    SELECT * FROM comments
    WHERE task_id=?
  `,[taskId]);

  return rows;
};