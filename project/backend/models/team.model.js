const db = require("../config/db");

exports.createTeam = async (team)=>{

  return db.execute(`
    INSERT INTO teams
    (team_name,manager_id)
    VALUES (?,?)
  `,[
    team.team_name,
    team.manager_id
  ]);

};

exports.getTeams = async ()=>{

  const [rows] = await db.execute(`
    SELECT * FROM teams
  `);

  return rows;

};