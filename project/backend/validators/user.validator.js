const Joi = require("joi");

exports.createUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("ADMIN","MANAGER","LEAD","EMPLOYEE"),
  team_id: Joi.number().allow(null)
});