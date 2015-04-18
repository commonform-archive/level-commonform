var clone = require('clone');

module.exports = function denormalize(form, normalizedForms) {
  form = clone(form);
  form.content = form.content.map(function(element) {
    if (element.hasOwnProperty('digest')) {
      var childDigest = element.digest;
      delete element.digest;
      var normalizedChild = normalizedForms[childDigest];
      element.form = denormalize(normalizedChild, normalizedForms);
    }
    return element;
  });
  return form;
};
