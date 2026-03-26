const router = require("express").Router();
const auth = require("../middleware/auth.middleware");

const model = require("../models/comment.model");

router.post("/", auth, async (req,res)=>{

  await model.addComment(
    req.body.task_id,
    req.user.id,
    req.body.comment
  );

  res.json({message:"comment added"});

});

router.get("/:taskId", auth, async (req,res)=>{

  const data =
  await model.getComments(req.params.taskId);

  res.json(data);

});

module.exports = router;