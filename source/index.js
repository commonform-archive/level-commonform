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

function LevelCommonForm(levelup) {
  if (!(this instanceof LevelCommonForm)) {
    return new LevelCommonForm(levelup);
  }
  this.database = levelup;
}

var prototype = LevelCommonForm.prototype;

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

prototype.putForm = function(nestedForm, callback) {
  var thisLibrary = this;

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
          result && result !== serialize.stringify(nestedForms[digest])
        );
      });
    }.bind(this);

    async.some(digests, collidesWithExisting, function(result) {
      /* istanbul ignore if -- covered by TAP test */
      if (result) {
        callback(new Error('Hash collission'));
      } else {
        var batch = amplify(
          rootDigest,
          nestedForm,
          normalizedForms,
          [], // no parents of root form
          SEPARATOR
        );

        thisLibrary.database.batch(batch, utf8Encoding, function(error) {
          /* istanbul ignore if */
          if (error) {
            callback(error);
          } else {
            callback(null, rootDigest);
          }
        });
      }
    });
  }
};

prototype.getForm = function(digest, callback) {
  var key = 'forms' + SEPARATOR + digest;
  return this.database.get(key, function(error, data) {
    /* istanbul ignore if */
    if (error) {
      callback(error);
    } else {
      callback(null, serialize.parse(data));
    }
  });
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
    })
      .pipe(transform);
    return transform;
  };
});

module.exports = LevelCommonForm;

module.exports.version = '0.0.4-prerelease-2';
