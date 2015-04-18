var normalize = require('commonform-normalize');
var sublevel = require('level-sublevel');
var through = require('through2');
var writeStream = require('level-write-stream');

var amplify = require('./amplify');

var STRING_SUBLEVELS = ['blanks', 'digests', 'headings', 'terms'];
var OBJECT_SUBLEVELS = ['forms', 'relationships'];
var SUBLEVELS = STRING_SUBLEVELS.concat(OBJECT_SUBLEVELS);

function CommonFormLibrary(levelup) {
  if (!(this instanceof CommonFormLibrary)) {
    return new CommonFormLibrary(levelup);
  }
  var thisLibrary = this;
  var database = sublevel(levelup);
  SUBLEVELS.forEach(function(sublevelName) {
    thisLibrary['_' + sublevelName] = database.sublevel(sublevelName);
  });
  thisLibrary._createSublevelWriteStream = writeStream(database);
}

var prototype = CommonFormLibrary.prototype;

prototype.createFormsWriteStream = function() {
  var library = this;
  var transform = through.obj(function(form, encoding, callback) {
    var digest = normalize(form).root;
    amplify(library, digest, form)
      .concat([{
        type: 'put',
        key: 'something',
        value: 'not empty'
      }])
      .forEach(this.push.bind(this));
    callback();
  });
  transform.pipe(this._createSublevelWriteStream());
  return transform;
};

prototype.createFormsReadStream = function() {
  return this._forms.createReadStream()
    .pipe(through.obj(function(chunk, encoding, callback) {
      this.push({digest: chunk.key, form: JSON.parse(chunk.value)});
      callback();
    }));
};

STRING_SUBLEVELS.forEach(function(sublevelName) {
  var capitalized = (
    sublevelName[0].toUpperCase() + sublevelName.slice(1)
  );
  var functionName = 'create' + capitalized + 'ReadStream';
  prototype[functionName] = function() {
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
