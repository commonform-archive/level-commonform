var permutations = [
  require('./relationship-key-order.json')
];

module.exports = function(triple, separator) {
  return permutations.map(function(permutation) {
    return permutation.reduce(function(keys, key) {
      return keys.concat([triple[key]]);
    }, []).join(separator) + separator;
  });
};
