/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var normalize = require('commonform-normalize');

var makeLibrary = require('./helpers/make-library');

describe('Get/Set Interface', function() {
  beforeEach(function() {
    this.library = makeLibrary();
  });

  var simpleForm = {content: ['A test form']};
  var simpleFormDigest = normalize(simpleForm).root;

  it('serves forms by digest', function(done) {
    var library = this.library;
    library.putForm(simpleForm, function() {
      library.getForm(simpleFormDigest, function(error, form) {
        expect(form).to.eql(simpleForm);
        done();
      });
    });
  });
});
