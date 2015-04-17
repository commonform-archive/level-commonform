/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var Library = require('..');
var levelup = require('levelup');
var concat = require('concat-stream');
var memdown = require('memdown');
var normalize = require('commonform-normalize');

describe('Library', function() {
  it('exports a function', function() {
    expect(Library).to.be.a('function');
  });

  it('stores and reproduces forms', function(done) {
    var lib = new Library(levelup({db: memdown}));
    var form = {content: ['A test form']};
    // Write the form.
    lib.createFormWriteStream().end(form, function() {
      // Read the form.
      lib.createFormReadStream().pipe(concat(function(data) {
        expect(data[0].form).to.eql(form);
        done();
      }));
    });
  });

  it('stores and reproduces used terms', function() {
    var lib = new Library(levelup({db: memdown}));
    var term = 'Indemnification';
    var form = {content:[{use: term}]};
    // Write the form.
    lib.createFormWriteStream().end(form, function() {
      // Read the term used.
      lib.createTermReadStream().pipe(concat(function(data) {
        expect(data).to.include(term);
        done();
      }));
    });
  });

  it('stores and reproduces defined terms', function() {
    var lib = new Library(levelup({db: memdown}));
    var term = 'Indemnification';
    var form = {content:[{definition: term}]};
    // Write the form.
    lib.createFormWriteStream().end(form, function() {
      // Read the term defined.
      lib.createTermReadStream().pipe(concat(function(data) {
        expect(data).to.include(term);
        done();
      }));
    });
  });
});
