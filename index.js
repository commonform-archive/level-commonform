module.exports = LevelCommonForm

var meta = require('./private/meta')
var streamCreatorName = require('./private/stream-creator-name')
var streamNames = require('./private/stream-names')
var streamRelations = require('./private/stream-relations')

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
  return streamNames.call(this, 'form', startingWith) }

meta.namespaces
  .map(function(namespace) {
    return namespace.prefix })
  .forEach(function(prefix) {
    prototype[streamCreatorName(prefix)] = function(startingWith) {
      return streamNames.call(this, prefix, startingWith) } })

// Relation streams

prototype.createParentStream = function(child) {
  return streamRelations.call(this, 'parent', child) }

meta.relations
  .map(function(relation) {
    return relation.prefix })
  .forEach(function(relation) {
    prototype[streamCreatorName(relation)] = function(name) {
      return streamRelations.call(this, relation, name) } })
