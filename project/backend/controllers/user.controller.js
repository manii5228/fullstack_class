const bcrypt = require("bcrypt");
const User = require("../models/user.model");

exports.createUser = async (req, res) => {

  const hashed = await bcrypt.hash(req.body.password, 10);

  await User.createUser({
    ...req.body,
    password_hash: hashed
  });

  res.json({ message: "User created" });
};

exports.getUsers = async (req, res) => {

  const users = await User.getUsers();

  res.json(users);
};

exports.updateRole = async (req, res) => {

  await User.updateRole(req.params.id, req.body.role);

  res.json({ message: "Role updated" });
};