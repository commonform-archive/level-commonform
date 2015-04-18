var permute = require('./permute');
var serialize = require('commonform-serialize');

// Create permutations of an RDF triple expressing a relationship.
module.exports = function(
  subject, predicate, object, depth, result, separator
) {
  return permute({
    subject: subject,
    predicate: predicate,
    object: object,
    depth: depth
  }, separator).map(function(key) {
    return {
      type: 'put',
      key: 'relationships' + separator + key,
      value: serialize.stringify(result)
    };
  });
};
