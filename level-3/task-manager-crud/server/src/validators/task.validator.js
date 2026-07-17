const Joi = require('joi');
const ApiError = require('../errors/ApiError');

/**
 * Validation schema for creating a task
 */
const createTaskSchema = Joi.object({
  title: Joi.string().required().max(100).messages({
    'string.empty': 'Task title is required',
    'string.max': 'Task title cannot exceed 100 characters',
    'any.required': 'Task title is required'
  }),
  completed: Joi.boolean().optional()
});

/**
 * Validation schema for updating a task
 */
const updateTaskSchema = Joi.object({
  title: Joi.string().max(100).optional().messages({
    'string.max': 'Task title cannot exceed 100 characters'
  }),
  completed: Joi.boolean().optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation middleware
 * @param {Joi.Schema} schema 
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  validate
};
