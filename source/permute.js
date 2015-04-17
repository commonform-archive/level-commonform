var permutations = [
  ['object', 'predicate', 'subject'],
  ['object', 'subject', 'predicate'],
  ['predicate', 'object', 'subject'],
  ['predicate', 'subject', 'object'],
  ['subject', 'object', 'predicate'],
  ['subject', 'predicate', 'object']
];

module.exports = function(triple, separator) {
  return permutations.map(function(permutation) {
    return (
      (
        permutation.reduce(function(keys, key) {
          return keys.concat([triple[key]]);
        }, [])
          .concat([triple.depth.toString()])
          .join(separator)
      ) +
      separator
    );
  });
};
