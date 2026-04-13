const model = require("../models/team.model");

exports.createTeam = async (req,res)=>{
  try{
    await model.createTeam(req.body);
    res.json({message:"Team created"});
  }catch(err){
    res.status(500).json({error:err.message});
  }
};

exports.getTeams = async (req,res)=>{
  try{
    const teams = await model.getTeams();
    res.json(teams);
  }catch(err){
    res.status(500).json({error:err.message});
  }
};