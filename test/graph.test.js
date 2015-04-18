/* jshint node: true, mocha: true */
var concat = require('concat-stream');
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');
var normalize = require('commonform-normalize');

var Library = require('..');

describe('Graph', function() {
  describe('Depth-zero Relationships', function() {
    var DEFINED = 'Defined';
    var INSERTED = 'Inserted';
    var REFERENCED = 'Referenced';
    var USED = 'Used';
    var UTILIZED = 'Utilized';
    var childForm = {content:['A child form']};
    var childDigest = normalize(childForm).root;
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
        object: childDigest
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

    it('links headings to summarized children', function(done) {
      this.library.createFormsReadStream({
        predicate: 'summarizes',
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

  describe('Deep Relationships', function() {
    var DEFINED = 'Agreement';
    var childForm = {content: [{definition: DEFINED}]};
    var childDigest = normalize(childForm).root;
    var childResult = {
      digest: childDigest,
      form: childForm
    };
    var parentForm = {content:[{form: childForm}]};
    var parentDigest = normalize(parentForm).root;
    var parentResult = {
      digest: parentDigest,
      form: parentForm
    };

    beforeEach(function(done) {
      var library = this.library = new Library(levelup({db: memdown}));
      var writeStream = library.createFormsWriteStream();
      writeStream.write(parentForm);
      writeStream.end(done);
    });

    it('links defined terms to child and parent', function(done) {
      this.library.createFormsReadStream({
        predicate: 'defines',
        object: DEFINED
      }).pipe(concat(function(data) {
        expect(data).to.be.an('array');
        expect(data).to.include(childResult);
        expect(data).to.include(parentResult);
        done();
      }));
    });

    it('links defined terms to children at depth 0', function(done) {
      this.library.createFormsReadStream({
        predicate: 'defines',
        object: DEFINED,
        depth: 0
      }).pipe(concat(function(data) {
        expect(data).to.eql([childResult]);
        done();
      }));
    });

    it('links defined terms to parents at depth', function(done) {
      this.library.createFormsReadStream({
        predicate: 'defines',
        object: DEFINED,
        depth: 1
      }).pipe(concat(function(data) {
        expect(data).to.eql([parentResult]);
        done();
      }));
    });
  });
});
