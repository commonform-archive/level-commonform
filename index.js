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

module.exports = LevelCommonForm

var meta = require('./private/meta')
var streamCreatorName = require('./private/stream-creator-name')
var createNamespaceStream = require('./private/create-namespace-stream')
var createRelationStream = require('./private/create-relation-stream')

function LevelCommonForm(levelup) {
  if (!(this instanceof LevelCommonForm)) {
    return new LevelCommonForm(levelup) }
  this.levelup = levelup }

var prototype = LevelCommonForm.prototype

prototype.putForm = require('./public/put-form')

prototype.getForm = require('./public/get-form')

prototype.createFormStream = require('./public/create-form-stream')

// Namespace streams

prototype.createDigestStream = function(startingWith) {
  return createNamespaceStream.call(this, 'form', startingWith) }

meta.namespaces
  .map(function(namespace) {
    return namespace.prefix })
  .forEach(function(prefix) {
    prototype[streamCreatorName(prefix)] = function(startingWith) {
      return createNamespaceStream.call(this, prefix, startingWith) } })

// Relation streams

prototype.createParentStream = function(child) {
  return createRelationStream.call(this, 'parent', child) }

meta.relations
  .map(function(relation) {
    return relation.prefix })
  .forEach(function(relation) {
    prototype[streamCreatorName(relation)] = function(name) {
      return createRelationStream.call(this, relation, name) } })
