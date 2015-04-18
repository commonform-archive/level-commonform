/* jshint mocha: true */
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');

var Library = require('..');

describe('Errors', function() {
  it('for invalid forms', function() {
    var library = new Library(levelup({db: memdown}));
    var stream = library.createFormsWriteStream();
    var caughtError = false;
    stream
      .on('error', function(error) {
        caughtError = true;
        expect(error.message).to.equal('Invalid form');
      })
      .on('finish', function() {
        expect(caughtError).to.equal(true);
      });
    stream.end({content: [{invalid: 'content'}]});
  });
});
