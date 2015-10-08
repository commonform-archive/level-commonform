var levelup = require('levelup')
var lvf = require('.')
var memdown = require('memdown')
var merkleize = require('commonform-merkleize')
var tape = require('tape')

function createTestStore() {
  return lvf(levelup({ db: memdown })) }

tape('put an invalid form', function(test) {
  test.plan(1)
  var level = createTestStore()
  var form = { junk: 'data' }
  level.putForm(form, function(error) {
    test.equal(error.message, 'Invalid form') }) })

tape('put and get a form', function(test) {
  test.plan(3)
  var level = createTestStore()
  var form = { content: [ 'This is a test' ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    level.getForm(digest, function(error, got) {
      test.ifError(error, 'no error on get')
      test.deepEqual(form, got, 'get the form back') }) }) })

tape('put a form and stream digests', function(test) {
  test.plan(2)
  var level = createTestStore()
  var form = { content: [ 'This is a test' ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createDigestStream()
      .on('data', function(digest) {
        digests.push(digest) })
      .on('end', function() {
        test.deepEqual(digests, [ digest ], 'digest in list') }) }) })

tape('put a form and get its child', function(test) {
  test.plan(3)
  var level = createTestStore()
  var child = { content: [ 'This is a test' ] }
  var parent = { content: [ { form: child } ] }
  var childDigest = merkleize(child).digest
  level.putForm(parent, function(error) {
    test.ifError(error, 'no error on put')
    level.getForm(childDigest, function(error, got) {
      test.ifError(error, 'no error on get')
      test.deepEqual(got, child, 'get the child back') }) }) })
