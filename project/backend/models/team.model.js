const db = require("../config/db");

exports.createTeam = async (team)=>{

  return db.execute(`
    INSERT INTO teams
    (team_name,manager_id)
    VALUES (?,?)
  `, [
    team.team_name || null,
    team.manager_id !== undefined ? team.manager_id : null
  ]);

};

exports.getTeams = async ()=>{

  const [rows] = await db.execute(`
    SELECT * FROM teams
  `);

  return rows;

};