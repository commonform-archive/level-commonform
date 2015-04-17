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
        }).map(function(key) {
          return {
            prefix: sublevel._graph,
            type: 'put',
            key: key,
            value: JSON.stringify(form)
          };
        });
      };

      if (predicate.definition(element)) {
        return operations.concat(permutationsOf(
          digest, 'defines', element.definition, 0
        ));
      } else if (predicate.use(element)) {
        return operations.concat(permutationsOf(
          digest, 'uses', element.use, 0
        ));
      } else if (predicate.blank(element)) {
        return operations.concat(permutationsOf(
          digest, 'inserts', element.blank, 0
        ));
      } else if (predicate.reference(element)) {
        return operations.concat(permutationsOf(
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
