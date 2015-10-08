module.exports = createNamespaceStream

var through = require('through2')
var encode = require('./encode')
var decode = require('./decode')

function createNamespaceStream(prefix, startingWith) {
  var transform = through.obj(function(chunk, _, callback) {
    callback(null, decode(chunk)[1]) })
  var options = {
    keys: true,
    values: false,
    gt: encode([ prefix, ( startingWith || null ) ]),
    lt: encode([ prefix, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }
