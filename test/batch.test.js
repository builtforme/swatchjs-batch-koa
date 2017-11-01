const bunyan = require('bunyan');
const expect = require('chai').expect;
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
  });
  const handler = batch(model);

  it('should execute all requested methods', () => {
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

    expect(handler.call(swatchCtx, ops)).to.deep.equal(expected);
  });

  it('should return an error if a method does not exist', () => {
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

    expect(handler.call(swatchCtx, ops)).to.deep.equal(expected);
  });

  it('should return an error if the method throws', () => {
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

    expect(handler.call(swatchCtx, ops)).to.deep.equal(expected);
  });

  it('should throw if ops is invalid', () => {
    expect(() => handler(10)).to.throw('invalid_request');
  });
});
