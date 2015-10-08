module.exports = LevelCommonForm

var analyze = require('commonform-analyze')
var asap = require('asap')
var bytewise = require('bytewise/encoding/hex')
var get = require('keyarray-get')
var isChild = require('commonform-predicate').child
var merkleize = require('commonform-merkleize')
var serialize = require('commonform-serialize')
var through = require('through2')
var validate = require('commonform-validate')

var parse = serialize.parse
var stringify = serialize.stringify

var decode = bytewise.decode
var encode = bytewise.encode

var NO_VALUE = undefined

var RELATIONS = [
  { prefix: 'definition', analysis: 'definitions' },
  { prefix: 'use',        analysis: 'uses' },
  { prefix: 'reference',  analysis: 'references' },
  { prefix: 'insertion',  analysis: 'blanks' },
  { prefix: 'inclusion',  analysis: 'headings' } ]

var NAMESPACES = [
  { prefix: 'heading', analyses: [ 'headings', 'references' ] },
  { prefix: 'term',    analyses: [ 'definitions', 'uses' ] },
  { prefix: 'blank',   analyses: [ 'blanks' ] } ]

function formKey(digest) {
  return encode([ 'form', digest ]) }

function LevelCommonForm(levelup) {
  if (!(this instanceof LevelCommonForm)) {
    return new LevelCommonForm(levelup) }
  this.levelup = levelup }

var prototype = LevelCommonForm.prototype

prototype.getForm = function(digest, callback) {
  var key = formKey(digest)
  this.levelup.get(key, function(error, json) {
    if (error) {
      if (error.notFound) {
        callback() }
      else {
        callback(error) } }
    else {
      var form = parse(json)
      callback(null, form) } }) }

function batchKeys(batch, analysis, prefix) {
  Object.keys(analysis)
    .forEach(function(name) {
      batch.put(encode([ prefix, name ]), NO_VALUE) }) }

function batchRelations(batch, analysis, merkle, relation) {
  Object.keys(analysis)
    .forEach(function(name) {
      analysis[name]
        .forEach(function(keyArray) {
          var digest = get(merkle, keyArray.slice(0, -2)).digest
          var key = encode([ relation, name, digest ])
          batch.put(key, NO_VALUE) }) }) }

function addNamesToBatch(batch, form, merkle) {
  var analysis = analyze(form)
  RELATIONS
    .forEach(function(relation) {
      var prefix = relation.prefix
      var subAnalysis = analysis[relation.analysis]
      batchRelations(batch, subAnalysis, merkle, prefix) })
  NAMESPACES
    .forEach(function(namespace) {
      var prefix = namespace.prefix
      namespace.analyses
        .forEach(function(analysisKey) {
          var subAnalysis = analysis[analysisKey]
          batchKeys(batch, subAnalysis, prefix) }) }) }

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

prototype.putForm = function(form, callback) {
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

function streamNames(prefix) {
  var transform = through.obj(function(chunk, _, callback) {
    callback(null, decode(chunk)[1]) })
  var options = {
    keys: true,
    values: false,
    gt: encode([ prefix, null ]),
    lt: encode([ prefix, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }

function capitalize(string) {
  return ( string.charAt(0).toUpperCase() + string.slice(1) ) }

prototype.createDigestStream = function() {
  return streamNames.call(this, 'form') }

NAMESPACES
  .map(function(namespace) {
    return namespace.prefix })
  .forEach(function(prefix) {
    var capitalized = capitalize(prefix)
    prototype['create' + capitalized + 'Stream'] = function() {
      return streamNames.call(this, prefix) } })

function streamRelations(prefix, name) {
  var transform = through.obj(function(chunk, _, callback) {
    var digest = decode(chunk)[2]
    callback(null, digest) })
  var options = {
    keys: true,
    values: false,
    gt: encode([ prefix, name, null ]),
    lt: encode([ prefix, name, undefined ]) }
  this.levelup.createReadStream(options).pipe(transform)
  return transform }

prototype.createParentStream = function(child) {
  return streamRelations.call(this, 'parent', child) }

RELATIONS
  .map(function(relation) {
    return relation.prefix })
  .forEach(function(relation) {
    var capitalized = capitalize(relation)
    prototype['create' + capitalized + 'Stream'] = function(name) {
      return streamRelations.call(this, relation, name) } })

prototype.createFormStream = function() {
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
