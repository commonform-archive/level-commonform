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
