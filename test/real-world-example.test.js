/* jshint mocha: true */
var concat = require('concat-stream');
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');

var Library = require('..');

var example = require('./fixtures/Apache-2.0.json');

describe('Real-World Example', function() {
  beforeEach(function(done) {
    var library = this.library = new Library(levelup({db: memdown}));
    var writeStream = library.createFormsWriteStream();
    writeStream.end(example, done);
  });

  it('defines "Licensor"', function(done) {
    this.library.createFormsReadStream({
      predicate: 'defines',
      object: 'Licensor'
    })
      .pipe(concat(function(data) {
        expect(data).to.be.an('array');
        expect(data).to.have.length(3);
        done();
      }));
  });

  it('has "Grant of Patent License"', function(done) {
    this.library.createFormsReadStream({
      predicate: 'utilizes',
      object: 'Grant of Patent License'
    })
      .pipe(concat(function(data) {
        expect(data).to.be.an('array');
        expect(data).to.have.length(1);
        done();
      }));
  });

  it('implements "Grant of Patent License"', function(done) {
    this.library.createFormsReadStream({
      predicate: 'implements',
      object: 'Grant of Patent License'
    })
      .pipe(concat(function(data) {
        expect(data).to.be.an('array');
        expect(data).to.have.length(1);
        done();
      }));
  });
});
