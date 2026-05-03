const Joi = require("joi");

const base = Joi.string().trim().min(3).max(255).required().messages({
  "string.empty": "Title is required",
  "string.min": "Title must be at least 3 characters",
  "any.required": "Title is required",
});

exports.createTaskSchema = Joi.object({
  title: base,
});

exports.updateTaskSchema = Joi.object({
  title: base,
});