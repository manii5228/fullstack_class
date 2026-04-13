const db = require("../config/db");

exports.createUser = async (user) => {
  const sql = `
    INSERT INTO users (name,email,password_hash,role,team_id)
    VALUES (?,?,?,?,?)
  `;
  return db.execute(sql, [
    user.name || null,
    user.email || null,
    user.password_hash || null,
    user.role || 'EMPLOYEE',
    user.team_id || null
  ]);
};

exports.findByEmail = async (email) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email=?",
    [email]
  );
  return rows[0];
};

exports.findById = async (id) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE user_id=?",
    [id]
  );
  return rows[0];
};

exports.getUsers = async () => {
  const [rows] = await db.execute("SELECT * FROM users");
  return rows;
};

exports.updateRole = async (id, role) => {
  return db.execute(
    "UPDATE users SET role=? WHERE user_id=?",
    [role, id]
  );
};

exports.deactivate = async (id) => {
  return db.execute(
    "UPDATE users SET active=0 WHERE user_id=?",
    [id]
  );
};