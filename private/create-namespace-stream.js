module.exports = createNamespaceStream

var through = require('through2')
var encode = require('./encode')
var decode = require('./decode')

// Create a stream of namespace names that exist in the store.
function createNamespaceStream(prefix, startingWith) {
  var transform = through.obj(function(chunk, _, callback) {
    // Name record keys are structured `[ namespace, name ]`.
    callback(null, decode(chunk)[1]) })
  var options = {
    keys: true,
    values: false,
    // `null` is the lowest value in bytewise encoding.
    gt: encode([ prefix, ( startingWith || null ) ]),
    // `undefined` is the highest value in bytewise encoding.
    lt: encode([ prefix, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }
