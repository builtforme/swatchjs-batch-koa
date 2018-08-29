const { expect } = require('chai');

const swatch = require('..');

describe('index', () => {
  it('should be a function that creates the batch API model', () => {
    expect(swatch).to.be.a('function');
  });
});
