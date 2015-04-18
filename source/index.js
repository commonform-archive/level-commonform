var async = require('async');
var capitalize = require('capitalize');
var normalize = require('commonform-normalize');
var serialize = require('commonform-serialize');
var through = require('through2');
var validate = require('commonform-validate');

var amplify = require('./amplify');
var denormalize = require('./denormalize');

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
  var thisLibrary = this;
  var transform = through.obj(function(nestedForm, encoding, callback) {
    var thisTransform = this;
    if (!validate.form(nestedForm)) {
      callback(new Error('Invalid form'));
    } else {
      var normalizedForms = normalize(nestedForm);
      var rootDigest = normalizedForms.root;
      delete normalizedForms.root;

      // Collission detection
      var digests = Object.keys(normalizedForms);
      var nestedForms = digests.reduce(function(map, digest) {
        var normalizedChild = normalizedForms[digest];
        map[digest] = denormalize(normalizedChild, normalizedForms);
        return map;
      }, {});

      var collidesWithExisting = function(digest, callback) {
        var key = 'forms' + SEPARATOR + digest;
        this.database.get(key, function(error, result) {
          /* istanbul ignore next -- covered by TAP test */
          callback(
            result &&
            result !== serialize.stringify(nestedForms[digest])
          );
        });
      }.bind(thisLibrary);

      async.some(digests, collidesWithExisting, function(result) {
        /* istanbul ignore if -- covefred by TAP test */
        if (result) {
          callback(new Error('Hash collission'));
        } else {
          amplify(
            rootDigest,
            nestedForm,
            normalizedForms,
            [], // no parents of root form
            SEPARATOR
          ).forEach(function(operation) {
            thisTransform.push(operation);
          });

          // LevelUp flushes write operations buffered by a write stream
          // to .batch() next tick. If multiple forms are written in one
          // tick, they won't be able to use LevelUp's .get() to check
          // for hash collissions among them. setImmediate forces the
          // next form write behind earlier-scheduled I/O & callbacks.
          // This has no effect for collissions among children of a
          // parent form, but commonform-normalize should address those.
          setImmediate(function() {
            callback();
          });
        }
      });
    }
  });
  transform.pipe(this.database.createWriteStream(utf8Encoding));
  return transform;
};

var partialTripleKey = (function() {
  var KEY_ORDER = require('./relationship-key-order.json');
  var LENGTH = KEY_ORDER.length;
  var SEARCH_KEYS = KEY_ORDER.slice(0, LENGTH - 1);

  return function(pattern) {
    var key = SEARCH_KEYS
      .reduce(function(result, key) {
        if (pattern.hasOwnProperty(key)) {
          var value = pattern[key];
          if (
            (key === 'subject' || key === 'object') &&
             typeof value !== 'string'
          ) {
            value = normalize(value).root;
          }
          return result + value + SEPARATOR;
        } else {
          return result;
        }
      }, '');
    return key;
  };
})();

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

module.exports.version = '0.0.4-prerelease-1';
