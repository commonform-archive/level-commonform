/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var normalize = require('commonform-normalize');

var makeLibrary = require('./helpers/make-library');

describe('Get/Set/Has Interface', function() {
  beforeEach(function() {
    this.library = makeLibrary();
  });

  var simpleForm = {content: ['A test form']};
  var simpleFormDigest = normalize(simpleForm).root;

  it('serves forms by digest', function(done) {
    var library = this.library;
    library.putForm(simpleForm, function() {
      library.hasForm(simpleForm, function(error, existingDigest) {
        expect(existingDigest).to.be.a('string');
        library.getForm(simpleFormDigest, function(error, form) {
          expect(form).to.eql(simpleForm);
          done();
        });
      });
    });
  });

  it('does not have unknown forms', function(done) {
    var form = {content:['Not put']};
    this.library.hasForm(form, function(error, existing) {
      expect(existing).to.equal(false);
      done();
    });
  });
});
