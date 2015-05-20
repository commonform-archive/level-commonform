/* jshint node: true, mocha: true */
var concat = require('concat-stream');
var expect = require('chai').expect;
var normalize = require('commonform-normalize');

var makeLibrary = require('../helpers/make-library');

var asArrayOfObjects = {encoding:'object'};

describe('Storage', function() {
  beforeEach(function() {
    this.library = makeLibrary();
  });

  var simpleForm = {content: ['A test form']};
  var simpleFormDigest = normalize(simpleForm).root;

  it('stores forms', function(done) {
    var library = this.library;
    var result = {
      digest: simpleFormDigest,
      form: simpleForm
    };
    library.putForm(simpleForm, function() {
      library.createFormsReadStream()
        .pipe(concat(function(data) {
          expect(data).to.eql([result]);
          done();
        }));
    });
  });

  it('stores form digests', function(done) {
    var library = this.library;
    library.putForm(simpleForm, function() {
      library.createDigestsReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
          expect(data).to.eql([simpleFormDigest]);
          done();
        }));
    });
  });

  it('stores used terms', function(done) {
    var library = this.library;
    var term = 'Indemnification';
    var form = {
      content:[{use: term}]
    };
    library.putForm(form, function() {
      library.createTermsReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
          expect(data).to.eql([term]);
          done();
        }));
    });
  });

  it('stores defined terms', function(done) {
    var library = this.library;
    var term = 'Indemnification';
    var form = {
      content:[{definition: term}]
    };
    library.putForm(form, function() {
      library.createTermsReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
          expect(data).to.eql([term]);
          done();
        }));
    });
  });

  it('stores referenced headings', function(done) {
    var library = this.library;
    var heading = 'Intellectual Property';
    var form = {
      content:[{reference: heading}]
    };
    library.putForm(form, function() {
      library.createHeadingsReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
          expect(data).to.eql([heading]);
          done();
        }));
    });
  });

  it('stores inserted blanks', function(done) {
    var library = this.library;
    var blank = 'Company Name';
    var form = {content:[{blank: blank}]};
    library.putForm(form, function() {
      library.createBlanksReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
          expect(data).to.eql([blank]);
          done();
        }));
    });
  });

  it('stores included children', function(done) {
    var library = this.library;
    var child = {
      content: ['This is a child form']
    };
    var childDigest = normalize(child).root;
    var parent = {
      content: [{form: child}]
    };
    var parentDigest = normalize(parent).root;
    library.putForm(parent, function() {
      library.createFormsReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
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
    var library = this.library;
    var heading = 'Some Heading';
    var parent = {
      content: [{
        heading: heading,
        form: {content: ['Child form']}
      }]
    };
    library.putForm(parent, function() {
      library.createHeadingsReadStream()
        .pipe(concat(asArrayOfObjects, function(data) {
          expect(data).to.eql([heading]);
          done();
        }));
    });
  });
});
