var encode = require('./encode')

module.exports = function formKey(digest) {
  return encode([ 'form', digest ]) }
