var relationship = require('./relationship');

// Generate relationship storing operations for child and parents.
module.exports =
  function(result, parents, predicate, object, separator) {
    return parents
      .concat([result])
      .reverse()
      .reduce(function(operations, formResult, index) {
        return operations.concat(relationship(
          formResult.digest,
          predicate,
          object,
          index,
          formResult,
          separator
        ));
      }, []);
  };
