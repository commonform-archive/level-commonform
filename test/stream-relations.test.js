/* Copyright 2015 Kyle E. Mitchell
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var merkleize = require('commonform-merkleize')
var tape = require('tape')
var testStore = require('./test-store')

tape('put a form and stream definitions', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { definition: 'Agreement' } ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createDefinitionStream('Agreement')
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ digest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })

tape('put a form and stream uses', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { use: 'Agreement' } ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createUseStream('Agreement')
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ digest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })

tape('put a form and stream references', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { reference: 'Indemnity' } ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createReferenceStream('Indemnity')
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ digest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })

tape('put a form and stream insertions', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { blank: 'Name' } ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createInsertionStream('Name')
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ digest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })

tape('put a form and stream inclusions', function(test) {
  test.plan(2)
  var level = testStore()
  var form = {
    content: [
      { heading: 'Assignment',
        form: { content: [ 'Some text' ] } } ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createInclusionStream('Assignment')
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ digest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })

tape('put a form and stream insertions', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ { blank: 'Name' } ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createInsertionStream('Name')
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ digest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })

tape('put a child form and stream its parents', function(test) {
  test.plan(2)
  var level = testStore()
  var child = { content: [ 'This is a test' ] }
  var parent = { content: [ { form: child } ] }
  var childDigest = merkleize(child).digest
  level.putForm(parent, function(error, parentDigest) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createParentStream(childDigest)
      .on('data', function(term) {
        digests.push(term) })
      .on('end', function() {
        var expected = [ parentDigest ]
        test.deepEqual(digests, expected, 'digest in list') }) }) })
