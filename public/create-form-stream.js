module.exports = createFormStream

var decode = require('../private/decode')
var formKey = require('../private/form-key')
var parse = require('../private/parse')
var through = require('through2')

function createFormStream() {
  var transform = through.obj(function(chunk, _, callback) {
    var digest = decode(chunk.key)[1]
    var form = parse(chunk.value)
    callback(null, { digest: digest, form: form }) })
  var options = {
    keys: true,
    values: true,
    gt: formKey(null),
    lt: formKey(undefined) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }
