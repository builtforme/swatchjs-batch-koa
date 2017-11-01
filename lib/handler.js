function execHandler(method) {
  function handle(params) {
    /*
    4 - validation.wrapMiddleware(method.validate) to run validation on `args`
    5 - methodMiddleware.map(middleware.wrapMiddleware) to wrap method middleware
    6 - handler.raw/wrapped(method.handle) to wrap handler with onException logic
    */
    const swatchCtx = Object.assign(
      {},
      this,
    );
    const ctx = {
      swatchCtx,
    };
    method.validate(ctx, params);
    return method.handle(ctx);
  }

  return handle;
}

module.exports = execHandler;
