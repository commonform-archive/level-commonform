/* jshint mocha: true */
var expect = require('chai').expect;

var Library = require('..');

describe('level-commonform', function() {
  it('exports a function', function() {
    expect(Library).to.be.a('function');
  });

  it('creates a new instance without `new`', function() {
    expect(
      Library({}) // jshint ignore:line
    ).to.be.instanceof(Library);
  });
});
