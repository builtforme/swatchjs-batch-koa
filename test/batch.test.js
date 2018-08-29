const { expect } = require('chai');
const bunyan = require('bunyan');
const swatch = require('swatchjs');

const batch = require('../lib/batch');

const logger = bunyan.createLogger({
  name: 'swatch-batch-koa-test',
  streams: [{ path: '/dev/null' }],
});

const onException = (errorObj) => {
  throw errorObj;
};

const swatchCtx = {
  logger,
  request: {
    onException,
  },
};


describe('batch', () => {
  it('should return a handler function', () => {
    const handler = batch([]);
    expect(handler).to.be.a('function');
  });

  it('should throw if parameter is not a model', () => {
    expect(() => batch(10)).to.throw();
  });
});

describe('batch handler', () => {
  const model = swatch({
    add: (a, b) => a + b,
    sub: (a, b) => a - b,
    bad: () => { throw new Error('some_error'); },
    mid: {
      handler: () => { throw new Error('handler_exception'); },
      metadata: {
        middleware: [
          () => { throw new Error('middleware_exception'); },
        ],
      },
    },
  });
  const handler = batch(model);

  it('should execute all requested methods', (done) => {
    const ops = [
      {
        method: 'add',
        args: {
          a: 10,
          b: 20,
        },
      },
      {
        method: 'sub',
        args: {
          a: 50,
          b: 25,
        },
      },
    ];
    const expected = [
      {
        ok: true,
        result: 30,
      },
      {
        ok: true,
        result: 25,
      },
    ];

    handler.call(swatchCtx, ops).then((result) => {
      expect(result).to.deep.equal(expected);
      done();
    }).catch(done);
  });

  it('should return an error if a method does not exist', (done) => {
    const ops = [
      {
        method: 'add',
        args: {
          a: 10,
          b: 20,
        },
      },
      {
        method: 'foo',
        args: {},
      },
    ];
    const expected = [
      {
        ok: true,
        result: 30,
      },
      {
        ok: false,
        error: 'invalid_method',
        details: undefined,
      },
    ];

    handler.call(swatchCtx, ops).then((result) => {
      expect(result).to.deep.equal(expected);
      done();
    }).catch(done);
  });

  it('should return an error if the method throws', (done) => {
    const ops = [
      {
        method: 'add',
        args: {
          a: 10,
          b: 20,
        },
      },
      {
        method: 'bad',
        args: {},
      },
    ];
    const expected = [
      {
        ok: true,
        result: 30,
      },
      {
        ok: false,
        error: 'some_error',
        details: undefined,
      },
    ];

    handler.call(swatchCtx, ops).then((result) => {
      expect(result).to.deep.equal(expected);
      done();
    }).catch(done);
  });

  it('should run middleware before each method', (done) => {
    const ops = [
      {
        method: 'add',
        args: {
          a: 10,
          b: 20,
        },
      },
      {
        method: 'mid',
        args: {},
      },
    ];
    const expected = [
      {
        ok: true,
        result: 30,
      },
      {
        ok: false,
        error: 'middleware_exception',
        details: undefined,
      },
    ];

    handler.call(swatchCtx, ops).then((result) => {
      expect(result).to.deep.equal(expected);
      done();
    }).catch(done);
  });

  it('should throw if ops is invalid', (done) => {
    handler(10).then(() => {
      done(new Error('invalid_ops_should_have_failed'));
    }).catch((error) => {
      expect(error.message).to.equal('invalid_request');
      done();
    });
  });
});
