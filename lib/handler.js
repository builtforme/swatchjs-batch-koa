function execHandler(method) {
  function handle(params) {
    const ctx = {
      swatchCtx: {},
    };
    method.validate(ctx, params);
    return method.handle(ctx);
  }

  return handle;
}

module.exports = execHandler;
