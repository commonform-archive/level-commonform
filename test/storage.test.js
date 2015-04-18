/* jshint node: true, mocha: true */
var concat = require('concat-stream');
var expect = require('chai').expect;
var levelup = require('levelup');
var memdown = require('memdown');
var normalize = require('commonform-normalize');

var Library = require('..');

var obj = {encoding:'object'};

describe('Storage', function() {
  beforeEach(function() {
    this.lib = new Library(levelup({db: memdown}));
  });

  var simpleForm = {content: ['A test form']};
  var simpleFormDigest = normalize(simpleForm).root;

  it('stores forms', function(done) {
    var lib = this.lib;
    var result = {digest: simpleFormDigest, form: simpleForm};
    lib.createFormsWriteStream().end(simpleForm, function() {
      lib.createFormsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([result]);
        done();
      }));
    });
  });

  it('stores form digests', function(done) {
    var lib = this.lib;
    lib.createFormsWriteStream().end(simpleForm, function() {
      lib.createDigestsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([simpleFormDigest]);
        done();
      }));
    });
  });

  it('stores used terms', function(done) {
    var lib = this.lib;
    var term = 'Indemnification';
    var form = {content:[{use: term}]};
    lib.createFormsWriteStream().end(form, function() {
      lib.createTermsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([term]);
        done();
      }));
    });
  });

  it('stores defined terms', function(done) {
    var lib = this.lib;
    var term = 'Indemnification';
    var form = {content:[{definition: term}]};
    lib.createFormsWriteStream().end(form, function() {
      lib.createTermsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([term]);
        done();
      }));
    });
  });

  it('stores referenced headings', function(done) {
    var lib = this.lib;
    var heading = 'Intellectual Property';
    var form = {content:[{reference: heading}]};
    lib.createFormsWriteStream().end(form, function() {
      lib.createHeadingsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([heading]);
        done();
      }));
    });
  });

  it('stores inserted blanks', function(done) {
    var lib = this.lib;
    var blank = 'Company Name';
    var form = {content:[{blank: blank}]};
    lib.createFormsWriteStream().end(form, function() {
      lib.createBlanksReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([blank]);
        done();
      }));
    });
  });

  it('stores included children', function(done) {
    var lib = this.lib;
    var child = {content: ['This is a child form']};
    var childDigest = normalize(child).root;
    var parent = {content: [{form: child}]};
    var parentDigest = normalize(parent).root;
    lib.createFormsWriteStream().end(parent, function() {
      lib.createFormsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.include({
          digest: childDigest,
          form: child
        });
        expect(data).to.include({
          digest: parentDigest,
          form: parent
        });
        done();
      }));
    });
  });

  it('stores utilized headings', function(done) {
    var lib = this.lib;
    var heading = 'Some Heading';
    var parent = {
      content: [{
        heading: heading,
        form: {content: ['Child form']}
      }]
    };
    lib.createFormsWriteStream().end(parent, function() {
      lib.createHeadingsReadStream().pipe(concat(obj, function(data) {
        expect(data).to.eql([heading]);
        done();
      }));
    });
  });
});
