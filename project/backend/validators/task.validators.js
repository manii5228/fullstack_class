const Joi = require("joi");

exports.createTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  difficulty: Joi.string().valid("Easy","Medium","Hard"),
  priority_score: Joi.number().min(1).max(10),
  deadline: Joi.date(),
  assigned_to: Joi.number().required()
});