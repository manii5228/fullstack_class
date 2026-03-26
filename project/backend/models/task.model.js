const db = require("../config/db");

exports.getTasks = async () => {

  const [rows] = await db.execute(`
    SELECT * FROM tasks
  `);

  return rows;
};

exports.updateTask = async (id, data) => {

  return db.execute(`
    UPDATE tasks
    SET title=?, description=?, status=?
    WHERE task_id=?
  `, [
    data.title,
    data.description,
    data.status,
    id
  ]);
};

exports.deleteTask = async (id) => {

  return db.execute(`
    DELETE FROM tasks
    WHERE task_id=?
  `, [id]);
};