module.exports = createRelationStream

var decode = require('./decode')
var encode = require('./encode')
var through = require('through2')

function createRelationStream(prefix, name) {
  var transform = through.obj(function(chunk, _, callback) {
    var digest = decode(chunk)[2]
    callback(null, digest) })
  var options = {
    keys: true,
    values: false,
    gt: encode([ prefix, name, null ]),
    lt: encode([ prefix, name, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }

