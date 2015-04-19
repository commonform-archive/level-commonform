/* jshint mocha: true */
var expect = require('chai').expect;
var makeLibrary = require('./helpers/make-library');

describe('Errors', function() {
  beforeEach(function() {
    var library = makeLibrary();
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
