var capitalize = require('capitalize');
var normalize = require('commonform-normalize');
var serialize = require('commonform-serialize');
var through = require('through2');
var validate = require('commonform-validate');

var amplify = require('./amplify');

var SEPARATOR = '\xff\xff';

var utf8Encoding = {
  keyEncoding: 'utf8',
  valueEncoding: 'utf8'
};

function CommonFormLibrary(levelup) {
  if (!(this instanceof CommonFormLibrary)) {
    return new CommonFormLibrary(levelup);
  }
  this.database = levelup;
}

var prototype = CommonFormLibrary.prototype;

prototype.createFormsWriteStream = function() {
  var transform = through.obj(function(nestedForm, encoding, callback) {
    if (!validate.form(nestedForm)) {
      callback(new Error('Invalid form'));
    } else {
      var normalizedForms = normalize(nestedForm);
      amplify(
        normalizedForms.root,
        nestedForm,
        normalizedForms,
        SEPARATOR
      ).forEach(this.push.bind(this));
      callback();
    }
  });
  transform.pipe(this.database.createWriteStream(utf8Encoding));
  return transform;
};

var partialTripleKey = function(pattern) {
  return Object.keys(pattern)
    .sort()
    .reduce(function(result, key) {
      var value = pattern[key];
      if (
        (key === 'subject' || key === 'object') &&
         typeof value !== 'string'
      ) {
        value = normalize(value).root;
      }
      return result + value + SEPARATOR;
    }, '');
};

prototype.createFormsReadStream = function(searchPattern) {
  var prefix;
  if (searchPattern) {
    prefix = 'relationships' + SEPARATOR;
    var suffix = partialTripleKey(searchPattern);
    return this.database.createReadStream({
      keys: true,
      values: true,
      gt: prefix + suffix,
      lt: prefix + suffix + SEPARATOR
    })
      .pipe(through.obj(function(chunk, encoding, callback) {
        this.push(serialize.parse(chunk.value));
        callback();
      }));
  } else {
    prefix = 'forms' + SEPARATOR;
    return this.database.createReadStream({
      keys: true,
      values: true,
      gt: prefix,
      lt: prefix + SEPARATOR
    })
      .pipe(through.obj(function(chunk, encoding, callback) {
        this.push({
          digest: chunk.key.slice(prefix.length),
          form: serialize.parse(chunk.value)
        });
        callback();
      }));
  }
};

var STRING_TYPES = ['digests', 'terms', 'headings', 'blanks'];

STRING_TYPES.forEach(function(sublevelName) {
  var functionName = 'create' + capitalize(sublevelName) + 'ReadStream';
  var prefix = sublevelName + SEPARATOR;
  prototype[functionName] = function() {
    var transform = through.obj(function(chunk, encoding, callback) {
      // Remove key prefixes.
      var key = chunk.slice(prefix.length);
      this.push(key);
      callback();
    });
    this.database.createReadStream({
      keys: true,
      values: false,
      gt: prefix,
      lt: prefix + SEPARATOR
    }).pipe(transform);
    return transform;
  };
});

module.exports = CommonFormLibrary;

module.exports.version = '0.0.0-prerelease';
