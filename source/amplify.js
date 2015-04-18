var predicate = require('commonform-predicate');
var permute = require('./permute');

var PLACEHOLDER_STRING = ' ';

module.exports = function(library, digest, form) {
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
        }, '\xff\xff').map(function(key) {
          return {
            prefix: library._relationships,
            type: 'put',
            key: key,
            value: JSON.stringify(form)
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
            prefix: library._terms,
            type: 'put',
            key: element.definition,
            value: PLACEHOLDER_STRING
          }])
          .concat(permutationsOf(
            digest, 'defines', element.definition, 0
          ));
      } else if (predicate.use(element)) {
        return operations
          .concat([{
            prefix: library._terms,
            type: 'put',
            key: element.use,
            value: element.use
          }])
          .concat(permutationsOf(
            digest, 'uses', element.use, 0
          ));
      } else if (predicate.blank(element)) {
        return operations
          .concat([{
            prefix: library._blanks,
            type: 'put',
            key: element.blank,
            value: element.blank
          }])
          .concat(permutationsOf(
            digest, 'inserts', element.blank, 0
          ));
      } else if (predicate.reference(element)) {
        return operations
          .concat([{
            prefix: library._headings,
            type: 'put',
            key: element.reference,
            value: element.reference
          }])
          .concat(permutationsOf(
            digest, 'references', element.reference, 0
          ));
      } else {
        throw new Error();
      }
    }
  }, [{
    prefix: library._forms,
    type: 'put',
    key: digest,
    value: JSON.stringify(form)
  }]);
};
