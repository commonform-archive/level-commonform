/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var normalize = require('commonform-normalize');
var levelup = require('levelup');
var concat = require('concat-stream');
var memdown = require('memdown');
var Library = require('..');

var obj = {encoding:'object'};

describe('commonform-library', function() {
  it('exports a function', function() {
    expect(Library).to.be.a('function');
  });
});
