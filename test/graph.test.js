/* jshint node: true, mocha: true */
var concat = require('concat-stream');
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');
var normalize = require('commonform-normalize');

var Library = require('..');

describe('Graph', function() {
  var DEFINED = 'Defined';
  var INSERTED = 'Inserted';
  var REFERENCED = 'Referenced';
  var USED = 'Used';
  var UTILIZED = 'Utilized';

  var childForm = {content:['A child form']};

  var childFormDigest = normalize(childForm).root;

  var parentForm = {
    content: [
      {use: USED},
      {definition: DEFINED},
      {reference: REFERENCED},
      {blank: INSERTED},
      {heading: UTILIZED, form: childForm}
    ]
  };

  var parentDigest = normalize(parentForm).root;

  var otherForm = {content:['Just text']};

  beforeEach(function(done) {
    var library = this.library = new Library(levelup({db: memdown}));
    var writeStream = library.createFormsWriteStream();
    writeStream.write(parentForm);
    writeStream.write(otherForm);
    writeStream.end(done);
  });

  it('links used terms to forms', function(done) {
    this.library.createFormsReadStream({
      predicate: 'uses',
      object: USED
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });

  it('links defined terms to forms', function(done) {
    this.library.createFormsReadStream({
      predicate: 'defines',
      object: DEFINED
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });

  it('links referenced headings to forms', function(done) {
    this.library.createFormsReadStream({
      predicate: 'references',
      object: REFERENCED
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });

  it('links inserted blanks to forms', function(done) {
    this.library.createFormsReadStream({
      predicate: 'inserts',
      object: INSERTED
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });

  it('links utilized headings to forms', function(done) {
    this.library.createFormsReadStream({
      predicate: 'utilizes',
      object: UTILIZED
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });

  it('links included child digests to parents', function(done) {
    this.library.createFormsReadStream({
      predicate: 'includes',
      object: childFormDigest
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });

  it('links included children to parents', function(done) {
    this.library.createFormsReadStream({
      predicate: 'includes',
      object: childForm
    }).pipe(concat(function(data) {
      expect(data).to.eql([{
        digest: parentDigest,
        form: parentForm
      }]);
      done();
    }));
  });
});
