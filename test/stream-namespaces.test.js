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

tape('put a form and stream digests with a prefix', function(test) {
  test.plan(2)
  var level = testStore()
  var form = { content: [ 'This is a test' ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var digests = [ ]
    level.createDigestStream('fff')
      .on('data', function(digest) {
        digests.push(digest) })
      .on('end', function() {
        test.deepEqual(digests, [ ]) }) }) })

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

tape('stream terms with prefix', function(test) {
  test.plan(2)
  var level = testStore()
  var form = {
    content: [
      { definition: 'Alpha' },
      { use: 'Beta' },
      { definition: 'Gamma' } ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var terms = [ ]
    level.createTermStream('B')
      .on('data', function(term) {
        terms.push(term) })
      .on('end', function() {
        var expected = [ 'Beta', 'Gamma' ]
        test.deepEqual(terms, expected) }) }) })

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

tape('stream blanks with prefix', function(test) {
  test.plan(2)
  var level = testStore()
  var form = {
    content: [
      { blank: 'Alpha' },
      { blank: 'Beta' },
      { blank: 'Gamma' } ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var blanks = [ ]
    level.createBlankStream('B')
      .on('data', function(blank) {
        blanks.push(blank) })
      .on('end', function() {
        var expected = [ 'Beta', 'Gamma' ]
        test.deepEqual(blanks, expected) }) }) })

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

tape('stream headings with prefix', function(test) {
  test.plan(2)
  var level = testStore()
  var form = {
    content: [
      { reference: 'Alpha' },
      { reference: 'Beta' },
      { reference: 'Gamma' } ] }
  level.putForm(form, function(error) {
    test.ifError(error, 'no error on put')
    var references = [ ]
    level.createHeadingStream('B')
      .on('data', function(reference) {
        references.push(reference) })
      .on('end', function() {
        var expected = [ 'Beta', 'Gamma' ]
        test.deepEqual(references, expected) }) }) })
