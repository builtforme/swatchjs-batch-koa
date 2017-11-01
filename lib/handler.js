function execHandler(method) {
  function handle(params) {
    /*
    0 - Update all previous callers to pass `this` = swatchCtx to here
    1 - Parent call should have initialized swatchCtx - Make local copy
    2 - Parent call should have initialized logger - Copy logger
    3 - Parent call should have done authAdapter - Copy auth context
    4 - validation.wrapMiddleware(method.validate) to run validation on `args`
    5 - methodMiddleware.map(middleware.wrapMiddleware) to wrap method middleware
    6 - handler.raw/wrapped(method.handle) to wrap handler with onException logic
    */
    const ctx = {
      swatchCtx: {},
    };
    method.validate(ctx, params);
    return method.handle(ctx);
  }

  return handle;
}

module.exports = execHandler;
