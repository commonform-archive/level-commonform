var tape = require('tape')
var testStore = require('./test-store')

tape('put a real-world example', function(test) {
  test.plan(2)
  var level = testStore()
  var form = require('./example')
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error')
    test.equal(
      digest,
      '7a8f6318627e25e6da74ccfcc9855ac2a3f829b30082eaaad80831b99ba32eed') }) })
