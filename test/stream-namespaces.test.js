var tape = require('tape')
var testStore = require('./test-store')

tape('put a form and stream digests', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ 'This is a test' ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createDigestStream()
      .on('data', function(digest) {
        digests.push(digest) })
      .on('end', function() {
        test.deepEqual(digests, [ digest ], 'digest in list') }) }) })

tape('put a form and stream terms', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { definition: 'Agreement' } ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var terms = [ ]
    level.createTermStream()
      .on('data', function(term) {
        terms.push(term) })
      .on('end', function() {
        var expected = [ 'Agreement' ]
        test.deepEqual(terms, expected, 'term in list') }) }) })

tape('put a form and stream blanks', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { blank: 'Price' } ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var blanks = [ ]
    level.createBlankStream()
      .on('data', function(term) {
        blanks.push(term) })
      .on('end', function() {
        var expected = [ 'Price' ]
        test.deepEqual(blanks, expected, 'term in list') }) }) })

tape('put a form and stream headings', function(test) {
  test.plan(2)
  var level = testStore()
  var form = {
    content: [
      { heading: 'Delegation',
        form: { content: [ 'More test' ] } },
      { reference: 'Assignment' } ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var headings = [ ]
    level.createHeadingStream()
      .on('data', function(term) {
        headings.push(term) })
      .on('end', function() {
        var expected = [ 'Assignment', 'Delegation' ]
        test.deepEqual(headings, expected, 'term in list') }) }) })
