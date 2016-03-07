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

module.exports = createFormStream

var decode = require('../private/decode')
var formKey = require('../private/form-key')
var parse = require('../private/parse')
var through = require('through2')

// Stream all of the forms in the store, together with their digests, as
// objects like `{ digest: "...", form: { ... } }`.
function createFormStream() {
  // Create a transform stream to convert native LevelUP stream chunks.
  var transform = through.obj(function(chunk, _, callback) {
    var digest = decode(chunk.key)[1]
    var form = parse(chunk.value)
    callback(null, { digest: digest, form: form }) })
  var options = {
    keys: true,
    values: true,
    gt: formKey(null),
    lt: formKey(undefined) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }
