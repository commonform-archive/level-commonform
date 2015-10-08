var levelup = require('levelup')
var lvf = require('..')
var memdown = require('memdown')

module.exports = function testStore() {
  return lvf(levelup({ db: memdown })) }
