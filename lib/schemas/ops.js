const Joi = require('joi');

const args =
  Joi
    .object();

const op =
  Joi
    .object()
    .keys({
      method: Joi.string(),
      args,
    })
    .requiredKeys('method', 'args');

const ops =
  Joi
    .array()
    .items(op);

module.exports = ops;
