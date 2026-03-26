const jwt = require("jsonwebtoken");
const db = require("../config/db");

module.exports =
async (req,res,next)=>{

  const token =
  req.headers.authorization?.split(" ")[1];

  if(!token)
  return res.status(401)
  .json({message:"unauthorized"});

  const [rows] =
  await db.execute(

  `SELECT * FROM token_blacklist
   WHERE token=?`,

  [token]

  );

  if(rows.length>0)
  return res.status(401)
  .json({message:"session expired"});

  try{

    req.user =
    jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();

  }catch{

    res.status(403)
    .json({message:"invalid token"});

  }

};