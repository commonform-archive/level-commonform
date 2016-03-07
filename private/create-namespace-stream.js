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

module.exports = createNamespaceStream

var through = require('through2')
var encode = require('./encode')
var decode = require('./decode')

// Create a stream of namespace names that exist in the store.
function createNamespaceStream(prefix, startingWith) {
  var transform = through.obj(function(chunk, _, callback) {
    // Name record keys are structured `[ namespace, name ]`.
    callback(null, decode(chunk)[1]) })
  var options = {
    keys: true,
    values: false,
    // `null` is the lowest value in bytewise encoding.
    gt: encode([ prefix, ( startingWith || null ) ]),
    // `undefined` is the highest value in bytewise encoding.
    lt: encode([ prefix, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }
