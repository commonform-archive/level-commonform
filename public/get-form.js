module.exports = getForm

var formKey = require('../private/form-key')
var parse = require('../private/parse')

function getForm(digest, callback) {
  var key = formKey(digest)
  this.levelup.get(key, function(error, stringified) {
    if (error) {
      if (error.notFound) {
        callback() }
      else {
        callback(error) } }
    else {
      var form = parse(stringified)
      callback(null, form) } }) }
