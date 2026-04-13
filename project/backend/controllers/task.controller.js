const db = require("../config/db");
const eventService = require("../services/event.service");

exports.createTask = async (req, res) => {
  const {
    title,
    status = 'pending',
    difficulty = 'medium',
    deadline,
    description = '',
    priority_score = 1,
    assigned_to = req.user.id
  } = req.body;

  const [result] = await db.execute(
    `INSERT INTO tasks
     (title,description,difficulty,priority_score,deadline,assigned_to,created_by,status)
     VALUES (?,?,?,?,?,?,?,?)`,
    [
      title,
      description,
      difficulty,
      priority_score,
      deadline,
      assigned_to,
      req.user.id,
      status
    ]
  );

  await eventService.logEvent({
    type: "TASK_CREATED",
    userId: assigned_to,
    taskId: result.insertId
  });

  res.json({ taskId: result.insertId });
};
exports.getTasks = async (req, res) => {

  const tasks = await require("../models/task.model").getTasks();

  res.json(tasks);
};

exports.updateTask = async (req, res) => {

  await require("../models/task.model")
  .updateTask(req.params.id, req.body);

  res.json({ message:"updated" });
};

exports.deleteTask = async (req, res) => {

  await require("../models/task.model")
  .deleteTask(req.params.id);

  res.json({ message:"deleted" });
};