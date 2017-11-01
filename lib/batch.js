const middleware = require('swatchjs-koa-middleware');

const execHandler = require('./handler');
const opsSchema = require('./schemas/ops');
const validator = require('./schemas/validator');

const response = middleware.response;
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
        const result = methodHandler.call(this, op.args);
        return response.success.call(this, result);
      } catch (e) {
        return response.error.call(this, e);
      }
    } else {
      const error = new Error('invalid_method');
      return response.error.call(this, error);
    }
  }

  function batchHandler(ops) {
    try {
      validate(ops);
    } catch (e) {
      throw new Error('invalid_request');
    }

    const that = this;
    return ops.map(op => (
      handleOp.call(that, op)
    ));
  }

  return batchHandler;
}

module.exports = batch;
