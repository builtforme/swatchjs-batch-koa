const expect = require('chai').expect;

const opsSchema = require('../lib/schemas/ops');
const schemaValidator = require('../lib/schemas/validator');

const validate = schemaValidator(opsSchema);

describe('validator (ops)', () => {
  it('should allow a valid schema', () => {
    const ops = [
      {
        method: 'method1',
        args: {},
      },
    ];
    const validated = validate(ops);

    expect(validated).to.deep.equal(ops);
  });

  it('should throw if method is not specified', () => {
    const invalidOps = [
      {
        args: {},
      },
    ];
    expect(() => validate(invalidOps)).to.throw('required');
  });

  it('should throw if method is not a string', () => {
    const invalidOps = [
      {
        method: 1,
        args: {},
      },
    ];
    expect(() => validate(invalidOps)).to.throw('string');
  });

  it('should throw if method is empty', () => {
    const invalidOps = [
      {
        method: '',
        args: {},
      },
    ];
    expect(() => validate(invalidOps)).to.throw('empty');
  });

  it('should throw if args is not specified', () => {
    const invalidOps = [
      {
        method: 'method1',
      },
    ];
    expect(() => validate(invalidOps)).to.throw('required');
  });

  it('should throw if args is not an object', () => {
    const invalidOps = [
      {
        method: 'method1',
        args: 10,
      },
    ];
    expect(() => validate(invalidOps)).to.throw('object');
  });
});
