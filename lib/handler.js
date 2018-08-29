const compose = require('koa-compose');
const { response } = require('swatchjs-koa-middleware');

const wrapper = require('./wrapper');

function execHandler(method) {
  async function handle(params) {
    // Create a mock koaCtx that is empty and doesnt share state
    //  All state should have been set on the swatchCtx by the
    //  batch endpoints middleware, so each sub-operation we try
    //  to handle should get its own swatchCtx with headers/etc
    const localCtx = {
      body: {},
      swatchCtx: Object.assign({}, this),
    };

    try {
      // Run validation on the specific endpoint before handler
      method.validate(localCtx, params);

      // Run all swatchJs middleware for the endpoint before handler
      const allMiddleware = method.metadata.middleware.map(
        wrapper.wrapMiddleware,
      );
      const allHandlers = allMiddleware.concat(
        wrapper.wrapHandler(method.handle),
      );

      // Compose all middleware with the final handler and execute
      //  At the end we return the `localCtx.body` result that was set
      //  since each operation independently returns a result object
      await compose(allHandlers)(localCtx);
      return localCtx.body;
    } catch (ex) {
      // Any exceptions during the change maps to an error result
      return response.error.call(localCtx.swatchCtx, ex);
    }
  }

  return handle;
}

module.exports = execHandler;
