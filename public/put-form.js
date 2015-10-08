module.exports = putForm

var NO_VALUE = require('../private/no-value')
var analyze = require('commonform-analyze')
var asap = require('asap')
var encode = require('../private/encode')
var formKey = require('../private/form-key')
var get = require('keyarray-get')
var isChild = require('commonform-predicate').child
var merkleize = require('commonform-merkleize')
var meta = require('../private/meta')
var stringify = require('../private/stringify')
var validate = require('commonform-validate')

function putForm(form, callback) {
  var valid = validate.form(form)
  if (!valid) {
    asap(function() {
      callback(new Error('Invalid form')) }) }
  else {
    var merkle = merkleize(form)
    var root = merkle.digest
    var batch = this.levelup.batch()
    addFormsToBatch(batch, form, merkle, [ ])
    addNamesToBatch(batch, form, merkle)
    batch.write(function(error) {
      if (error) {
        callback(error) }
      else {
        callback(null, root) } }) } }

function addFormsToBatch(batch, form, merkle, parents) {
  var json = stringify(form)
  var digest = merkle.digest
  var childParents = parents.concat(digest)
  var key = formKey(digest)
  batch.put(key, json)
  parents
    .forEach(function(parent) {
      batch.put(encode([ 'parent', digest, parent ]), NO_VALUE) })
  form.content
    .forEach(function(element, index) {
      if (isChild(element)) {
        var childForm = element.form
        var childMerkle = merkle.content[index]
        addFormsToBatch(batch, childForm, childMerkle, childParents) } }) }

function addNamesToBatch(batch, form, merkle) {
  var analysis = analyze(form)
  meta.relations
    .forEach(function(relation) {
      var prefix = relation.prefix
      var subAnalysis = analysis[relation.analysis]
      batchRelations(batch, subAnalysis, merkle, prefix) })
  meta.namespaces
    .forEach(function(namespace) {
      var prefix = namespace.prefix
      namespace.analyses
        .forEach(function(analysisKey) {
          var subAnalysis = analysis[analysisKey]
          batchKeys(batch, subAnalysis, prefix) }) }) }

function batchRelations(batch, analysis, merkle, relation) {
  Object.keys(analysis)
    .forEach(function(name) {
      analysis[name]
        .forEach(function(keyArray) {
          var digest = get(merkle, keyArray.slice(0, -2)).digest
          var key = encode([ relation, name, digest ])
          batch.put(key, NO_VALUE) }) }) }

function batchKeys(batch, analysis, prefix) {
  Object.keys(analysis)
    .forEach(function(name) {
      batch.put(encode([ prefix, name ]), NO_VALUE) }) }
