const execHandler = require('./handler');
const responses = require('./responses');
const opsSchema = require('./schemas/ops');
const validator = require('./schemas/validator');

const validate = validator(opsSchema);

function batch(model) {
  const methods = {};
  model.forEach((method) => {
    methods[method.name] = execHandler(method);
  });

  function handleOp(op) {
    if (op.method in methods) {
      try {
        const methodHandler = methods[op.method];
        const result = methodHandler(op.args);
        return responses.success(result);
      } catch (e) {
        return responses.exception(e);
      }
    } else {
      const error = new Error('invalid_method');
      return responses.exception(error);
    }
  }

  function batchHandler(ops) {
    try {
      validate(ops);
    } catch (e) {
      throw new Error('invalid_request');
    }

    return ops.map(handleOp);
  }

  return batchHandler;
}

module.exports = batch;
