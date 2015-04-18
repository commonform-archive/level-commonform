/* jshint mocha: true */
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');

var Library = require('..');

describe('Errors', function() {
  beforeEach(function() {
    var library = new Library(levelup({db: memdown}));
    this.writeStream = library.createFormsWriteStream();
  });

  it('for invalid forms', function(done) {
    this.writeStream
      .on('error', function(error) {
        expect(error.message).to.equal('Invalid form');
        done();
      })
      .end({content: [{invalid: 'content'}]});
  });
});
