var predicate = require('commonform-predicate');
var serialize = require('commonform-serialize');
var permute = require('./permute');

var PLACEHOLDER_STRING = ' ';

module.exports = function(library, digest, form, separator) {
  return form.content.reduce(function(operations, element) {
    if (predicate.text(element)) {
      return operations;
    } else {
      var permutationsOf = function(subject, predicate, object, depth) {
        return permute({
          subject: subject,
          predicate: predicate,
          object: object,
          depth: depth
        }, separator).map(function(key) {
          return {
            type: 'put',
            key: 'relationships' + separator + key,
            value: serialize.stringify(form)
          };
        });
      };

      if (predicate.child(element)) {
        return operations
          .concat(permutationsOf(digest, 'includes', element.form, 0))
          .concat(
            element.hasOwnProperty('heading') ?
              permutationsOf(digest, 'utilizes', element.heading, 0) :
              []
          );
      } else if (predicate.definition(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'terms' + separator + element.definition,
            value: PLACEHOLDER_STRING
          }])
          .concat(permutationsOf(
            digest, 'defines', element.definition, 0
          ));
      } else if (predicate.use(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'terms' + separator + element.use,
            value: PLACEHOLDER_STRING
          }])
          .concat(permutationsOf(
            digest, 'uses', element.use, 0
          ));
      } else if (predicate.blank(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'blanks' + separator + element.blank,
            value: PLACEHOLDER_STRING
          }])
          .concat(permutationsOf(
            digest, 'inserts', element.blank, 0
          ));
      } else if (predicate.reference(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'headings' + separator + element.reference,
            value: PLACEHOLDER_STRING
          }])
          .concat(permutationsOf(
            digest, 'references', element.reference, 0
          ));
      } else {
        throw new Error();
      }
    }
  }, [
    {
      type: 'put',
      key: 'forms' + separator + digest,
      value: serialize.stringify(form)
    },
    {
      type: 'put',
      key: 'digests' + separator + digest,
      value: PLACEHOLDER_STRING
    }
  ]);
};
