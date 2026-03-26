const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({ token, role: user.role });

  
};
const db = require("../config/db");

exports.logout = async (req,res)=>{

  const token =
  req.headers.authorization?.split(" ")[1];

  if(!token)
  return res.status(400)
  .json({message:"token missing"});

  await db.execute(

  `INSERT INTO token_blacklist(token)
   VALUES(?)`,

   [token]

  );

  res.json({
    message:"logged out"
  });

};