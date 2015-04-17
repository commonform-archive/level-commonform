/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var permute = require('../source/permute');

describe('permute()', function() {
  it('is a function', function() {
    expect(permute).to.be.a('function');
  });

  it('creates keys', function() {
    expect(
      permute({
        subject: 's',
        predicate: 'p',
        object: 'o',
        depth: 0
      }, '|')
    ).to.eql([
      'o|p|s|0|',
      'o|s|p|0|',
      'p|o|s|0|',
      'p|s|o|0|',
      's|o|p|0|',
      's|p|o|0|'
    ]);
  });
});
