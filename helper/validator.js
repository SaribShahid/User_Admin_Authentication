const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin').optional(),
  key: Joi.string().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email()
});

const passwordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const roleChangeSchema = Joi.object({
  userId: Joi.string().required(),
  newRole: Joi.string().valid('user', 'admin').required()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
  passwordSchema,
  roleChangeSchema
};
