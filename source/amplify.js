var predicate = require('commonform-predicate');
var serialize = require('commonform-serialize');
var relationship = require('./relationship');
var formRelationships = require('./form-relationships');

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
  // List of parent forms
  parents,
  // Separator character for compound LevelUp keys
  separator
) {
  var normalized = normalizedForms[digest];
  var result = {
    digest: digest,
    form: nestedForm
  };

  // Build a list of LevelUp operations for this form.
  return normalized.content.reduce(function(operations, element, index) {
    if (predicate.text(element)) {
      return operations;
    } else {
      /* istanbul ignore else */
      if (element.hasOwnProperty('digest')) {
        var childDigest = element.digest;
        pushAll(operations, formRelationships(
          result, parents, 'includes', childDigest, separator
        ));
        pushAll(operations, amplify(
          childDigest,
          // The nested version of the child form
          nestedForm.content[index].form,
          normalizedForms,
          parents.concat(result),
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
              .concat(formRelationships(
                result, parents, 'utilizes', heading, separator
              ))
              .concat(relationship(
                heading, 'summarizes', childDigest, 0, result, separator
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
          .concat(formRelationships(
            result, parents, 'defines', element.definition, separator
          ));
      } else if (predicate.use(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'terms' + separator + element.use,
            value: PLACEHOLDER_STRING
          }])
          .concat(formRelationships(
            result, parents, 'uses', element.use, separator
          ));
      } else if (predicate.blank(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'blanks' + separator + element.blank,
            value: PLACEHOLDER_STRING
          }])
          .concat(formRelationships(
            result, parents, 'inserts', element.blank, separator
          ));
      } else if (predicate.reference(element)) {
        return operations
          .concat([{
            type: 'put',
            key: 'headings' + separator + element.reference,
            value: PLACEHOLDER_STRING
          }])
          .concat(formRelationships(
            result, parents, 'references', element.reference, separator
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
