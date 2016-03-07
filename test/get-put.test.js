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

tape('put an invalid form', function(test) {
  test.plan(1)
  var level = testStore()
  var form = { junk: 'data' }
  level.putForm(form, function(error) {
    test.equal(error.message, 'Invalid form') }) })

tape('put and get a form', function(test) {
  test.plan(3)
  var level = testStore()
  var form = { content: [ 'This is a test' ] }
  level.putForm(form, function(error, digest) {
    test.ifError(error, 'no error on put')
    level.getForm(digest, function(error, got) {
      test.ifError(error, 'no error on get')
      test.deepEqual(form, got, 'get the form back') }) }) })

tape('put a form and get its child', function(test) {
  test.plan(3)
  var level = testStore()
  var child = { content: [ 'This is a test' ] }
  var parent = { content: [ { form: child } ] }
  var childDigest = merkleize(child).digest
  level.putForm(parent, function(error) {
    test.ifError(error, 'no error on put')
    level.getForm(childDigest, function(error, got) {
      test.ifError(error, 'no error on get')
      test.deepEqual(got, child, 'get the child back') }) }) })

tape('get nonexistent form', function(test) {
  test.plan(1)
  var level = testStore()
  var digest = new Array(65).join('a')
  level.getForm(digest, function(error, form) {
    test.equal(form, undefined) }) })
