const { response } = require('swatchjs-koa-middleware');

const execHandler = require('./handler');
const opsSchema = require('./schemas/ops');
const validator = require('./schemas/validator');

const validate = validator(opsSchema);

function batch(model) {
  const methods = {};
  model.forEach((method) => {
    methods[method.name] = execHandler(method);
  });

  async function handleOp(op) {
    if (op.method in methods) {
      const methodHandler = methods[op.method];
      const result = await methodHandler.call(this, op.args);
      return result;
    }

    const error = new Error('invalid_method');
    return response.error.call(this, error);
  }

  async function batchHandler(ops) {
    try {
      validate(ops);
    } catch (e) {
      throw new Error('invalid_request');
    }

    const that = this;
    const results = await Promise.all(
      ops.map(async (op) => {
        const r = await handleOp.call(that, op);
        return r;
      }),
    );
    return results;
  }

  return batchHandler;
}

module.exports = batch;
