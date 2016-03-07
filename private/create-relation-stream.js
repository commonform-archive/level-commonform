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

module.exports = createRelationStream

var decode = require('./decode')
var encode = require('./encode')
var through = require('through2')

// Create a stream of form digests, given a kind of relation and the "direct
// object" of the relation, such as "definition" and "Material Change".
function createRelationStream(prefix, name) {
  var transform = through.obj(function(chunk, _, callback) {
    // Relation keys are structured `[ relation, name, digest ]`.
    var digest = decode(chunk)[2]
    // Pass only the form digest through.
    callback(null, digest) })
  var options = {
    keys: true,
    values: false,
    // `null` is the lowest value in bytewise encoding.
    gt: encode([ prefix, name, null ]),
    // `undefined` is the highest value in bytewise encoding.
    lt: encode([ prefix, name, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }

