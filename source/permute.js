var permutations = [
  ['object', 'predicate', 'depth', 'subject'],
  // ['object', 'subject', 'predicate'],
  // ['predicate', 'object', 'subject'],
  // ['predicate', 'subject', 'depth', 'object'],
  // ['subject', 'object', 'predicate'],
  // ['subject', 'predicate', 'object']
];

module.exports = function(triple, separator) {
  return permutations.map(function(permutation) {
    return permutation.reduce(function(keys, key) {
      return keys.concat([triple[key]]);
    }, []).join(separator) + separator;
  });
};
