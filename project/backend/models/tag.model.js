const db = require("../config/db");

exports.createTag = async(name)=>{

  return db.execute(`
    INSERT INTO tags(tag_name)
    VALUES(?)
  `,[name]);

};

exports.assignTag = async(taskId,tagId)=>{

  return db.execute(`
    INSERT INTO task_tags
    VALUES(?,?)
  `,[taskId,tagId]);

};