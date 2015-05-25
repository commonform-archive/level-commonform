/* jshint node: true, mocha: true */
var async = require('async');
var expect = require('chai').expect;

var makeLibrary = require('../helpers/make-library');

describe('Bookmarks', function() {
  beforeEach(function() {
    this.library = makeLibrary();
  });

  it('stores bookmarks', function(done) {
    var library = this.library;
    var form = {content: ['test']};
    library.putForm(form, function(error, digest) {
      if (error) {
        throw error;
      } else {
        var bookmark = 'Some Form';
        async.series([
          library.putBookmark.bind(library, digest, bookmark),
          function(callback) {
            library.hasBookmark(bookmark, function(error, exists) {
              if (error) {
                callback(error);
              } else {
                expect(exists).to.equal(true);
                callback();
              }
            });
          },
          function(callback) {
            library.getBookmark(bookmark, function(error, result) {
              if (error) {
                callback(error);
              } else {
                expect(result).to.equal(digest);
                callback();
              }
            });
          }
        ], function(error) {
          if (error) {
            throw error;
          } else {
            done();
          }
        });
      }
    });
  });

  it('requires a valid bookamark', function(done) {
    var library = this.library;
    var form = {content: ['totally valid']};
    var bookmark = {invalid: 'bookmark'};
    library.putForm(form, function(error, digest) {
      if (error) {
        throw error;
      } else {
        library.putBookmark(digest, bookmark, function(error) {
          expect(error.invalidBookmark).to.equal(true);
          done();
        });
      }
    });
  });

  it('requires a valid digest', function(done) {
    var library = this.library;
    var digest = null;
    var bookmark = 'A valid bookmark';
    library.putBookmark(digest, bookmark, function(error) {
      expect(error.invalidDigest).to.equal(true);
      done();
    });
  });

  it('confirms absence of nonexistent', function(done) {
    this.library.hasBookmark('nonexistent', function(error, result) {
      expect(result).to.equal(false);
      done();
    });
  });
});
