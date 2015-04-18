/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');
var normalize = require('commonform-normalize');

var Library = require('..');

describe('Event', function() {
  beforeEach(function() {
    this.library = new Library(levelup({db: memdown}));
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
