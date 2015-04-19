/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var normalize = require('commonform-normalize');

var makeLibrary = require('./helpers/make-library');

describe('Event', function() {
  beforeEach(function() {
    this.library = makeLibrary();
  });

  var simpleForm = {content: ['A test form']};
  var simpleFormDigest = normalize(simpleForm).root;

  describe('"digest"', function() {
    it('is emitted on form write', function(done) {
      this.library.createFormsWriteStream()
        .on('digest', function(digest) {
          expect(digest).to.equal(simpleFormDigest);
          done();
        })
        .end(simpleForm);
    });
  });
});
