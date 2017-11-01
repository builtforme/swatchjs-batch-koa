const middleware = require('swatchjs-koa-middleware');

const response = middleware.response;

function wrapHandler(fn) {
  async function handlerWrapper(koaCtx) {
    const swatchCtx = koaCtx.swatchCtx;
    try {
      const result = await fn(koaCtx);
      koaCtx.body = response.success.call(swatchCtx, result);
    } catch (error) {
      koaCtx.body = response.error.call(swatchCtx, error);
    }
  }

  return handlerWrapper;
}

// Generic function wraps `fn` as Swatch KOA middleware
//  `fn` signature accepts Swatch ctx + next callback
//  Catches any errors and sets an error response
function wrapMiddleware(fn) {
  async function middlewareWrapper(koaCtx, next) {
    const swatchCtx = koaCtx.swatchCtx;
    try {
      await fn(swatchCtx, next);
    } catch (error) {
      // Auth error should turn into failure response
      koaCtx.body = response.error.call(swatchCtx, error);
    }
  }

  return middlewareWrapper;
}

module.exports = {
  wrapHandler,
  wrapMiddleware,
};
