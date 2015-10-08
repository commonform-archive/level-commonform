var tape = require('tape')
var testStore = require('./test-store')

tape('put a form and stream forms', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ 'This is a test' ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var records = [ ]
    level.createFormStream()
      .on('data', function(record) {
        records.push(record) })
      .on('end', function() {
        var expected = [ { digest: digest, form: form } ]
        test.deepEqual(records, expected, 'form in list') }) }) })

