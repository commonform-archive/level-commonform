var predicate = require('commonform-predicate');
var serialize = require('commonform-serialize');
var permute = require('./permute');

var PLACEHOLDER_STRING = ' ';

var pushAll = function(destination, source) {
  source.forEach(function(element) {
    destination.push(element);
  });
};

module.exports = function amplify(
  // The digest of the form to store, used to get the normalized form
  // from `normalizedForms`
  digest,
  // The nested, or "native", form
  // Forms are stored nested.
  nestedForm,
  // The output of `commonform-normalize`
  normalizedForms,
  // Separator character for compound LevelUp keys
  separator
) {
  var normalized = normalizedForms[digest];
  // Build a list of LevelUp operations for this form.
  return normalized.content.reduce(function(operations, element, index) {
    if (predicate.text(element)) {
      return operations;
    } else {
      // Create Hexastore-style permutations of an RDF triple with an
      // additional "depth" property.
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
            // Store the form and its digest as the value.
            value: serialize.stringify({
              digest: digest,
              form: nestedForm
            })
          };
        });
      };

      /* istanbul ignore else */
      if (element.hasOwnProperty('digest')) {
        var childDigest = element.digest;
        pushAll(operations, permutationsOf(
          digest, 'includes', childDigest, 0
        ));
        pushAll(operations, amplify(
          childDigest,
          // The nested version of the child form
          nestedForm.content[index].form,
          normalizedForms,
          separator
        ));
        if (element.hasOwnProperty('heading')) {
          var heading = element.heading;
          pushAll(
            operations,
            [{
              type: 'put',
              key: 'headings' + separator + heading,
              value: PLACEHOLDER_STRING
            }]
              .concat(permutationsOf(
                digest, 'utilizes', heading, 0
              ))
              .concat(permutationsOf(
                heading, 'summarizes', childDigest, 0
              ))
          );
        }
        return operations;
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
        throw new Error(
          'Invalid content element: ' + JSON.stringify(element)
        );
      }
    }
  }, [
    // The form itself
    {
      type: 'put',
      key: 'forms' + separator + digest,
      value: serialize.stringify(nestedForm)
    },
    // The form's digest
    {
      type: 'put',
      key: 'digests' + separator + digest,
      value: PLACEHOLDER_STRING
    }
  ]);
};
