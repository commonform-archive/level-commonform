var through = require('through2');
var sublevel = require('level-sublevel');
var amplify = require('./amplify');
var normalize = require('commonform-normalize');
var WriteStream = require('level-write-stream');

var STRING_SUBLEVELS = ['blanks', 'digests', 'headings', 'terms'];
var OBJECT_SUBLEVELS = ['forms', 'graph'];
var SUBLEVELS = STRING_SUBLEVELS.concat(OBJECT_SUBLEVELS);

function CommonFormLibrary(db) {
  if (!(this instanceof CommonFormLibrary)) {
    return new CommonFormLibrary(db);
  }
  this._db = db;
  var thisSublevel = this;
  SUBLEVELS.forEach(function(sublevelName) {
    thisSublevel['_' + sublevelName] = sublevel(db, sublevelName);
  });
  this._createSublevelWriteStream = WriteStream(this._graph);
};

var prototype = CommonFormLibrary.prototype;

prototype.createFormsWriteStream = function() {
  var thisSublevel = this;
  var transform = through.obj(function(form, encoding, callback) {
    // Normalized the form.
    var normalized = normalize(form);
    var digest = normalized.root;

    // Prepare a chunk for streaming.
    var chunk = {digest: digest, form: form};

    // Amplify the chunk into an array of levelup batch operations.
    var amplified = amplify(thisSublevel, chunk);
    var thisTransform = this;

    // Stream each operation.
    amplified.forEach(function(operation) {
      thisTransform.push(operation);
    });

    callback();
  });
  transform.pipe(this._createSublevelWriteStream());
  return transform;
};

prototype.createFormsReadStream = function() {
  return this._forms.createReadStream()
    .pipe(through.obj(function(chunk, encoding, callback) {
      this.push({
        digest: chunk.key,
        form: JSON.parse(chunk.value)
      });
      callback();
    }));
};

STRING_SUBLEVELS.forEach(function(sublevelName) {
  var capitalized = (
    sublevelName[0].toUpperCase() + sublevelName.slice(1)
  );
  prototype['create' + capitalized + 'ReadStream'] = function() {
    var transform = through.obj(function(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    });
    this['_' + sublevelName].createKeyStream().pipe(transform);
    return transform;
  };
});

module.exports = CommonFormLibrary;

module.exports.version = '0.0.0-prerelease';
