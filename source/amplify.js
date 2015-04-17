var predicate = require('commonform-predicate');
var permute = require('./permute');

module.exports = function(sublevel, chunk) {
  var digest = chunk.digest;
  var form = chunk.form;
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
            prefix: sublevel._graph,
            type: 'put',
            key: key,
            value: JSON.stringify(form)
          };
        });
      };

      if (predicate.child(element)) {
        return operations
          .concat(permutationsOf(digest, 'includes', child.form, 0))
          .concat(
            element.hasOwnProperty('heading') ?
              permutationsOf(digest, 'utilizes', element.heading, 0) :
              []
          );
      } else if (predicate.definition(element)) {
        return operations
          .concat([{
            prefix: sublevel._terms,
            type: 'put',
            key: element.definition,
            value: ''
          }])
          .concat(permutationsOf(
            digest, 'defines', element.definition, 0
          ));
      } else if (predicate.use(element)) {
        return operations
          .concat([{
            prefix: sublevel._terms,
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
            prefix: sublevel._blanks,
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
            prefix: sublevel._headings,
            type: 'put',
            key: element.reference,
            value: element.reference
          }])
          .concat(permutationsOf(
            digest, 'references', element.reference, 0
          ));
      }
    }
  }, [{
    type: 'put',
    key: digest,
    value: JSON.stringify(form),
    prefix: sublevel._forms
  }]);
};
