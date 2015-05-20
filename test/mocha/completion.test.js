/* jshint node: true, mocha: true */
var async = require('async');
var concat = require('concat-stream');
var expect = require('chai').expect;

var makeLibrary = require('../helpers/make-library');

var asArrayOfObjects = {encoding:'object'};

describe('Completion', function() {
  beforeEach(function() {
    this.library = makeLibrary();
  });

  it('completes headings', function(done) {
    var library = this.library;
    async.series([
      function(callback) {
        library.putForm({
          content: [{
            heading: 'Alpha Heading',
            form: {content: ['Child form']}
          }]
        }, callback);
      },
      function(callback) {
        library.putForm({
          content: [{
            heading: 'Beta Heading',
            form: {content: ['Child form']}
          }]
        }, callback);
      },
      function(callback) {
        library.createHeadingsReadStream('A')
          .pipe(concat(asArrayOfObjects, function(data) {
            expect(data).to.eql(['Alpha Heading']);
            callback();
          }));
      }
    ], function(error) {
      expect(!!error).to.eql(false);
      done();
    });
  });
});
