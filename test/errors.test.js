/* jshint mocha: true */
var expect = require('chai').expect;
var makeLibrary = require('./helpers/make-library');

describe('Errors', function() {
  it('for invalid forms', function(done) {
    var invalidForm = {
      content: [{invalid: 'content'}]
    };
    makeLibrary().putForm(invalidForm, function(error) {
      expect(error.message).to.equal('Invalid form');
      done();
    });
  });
});
