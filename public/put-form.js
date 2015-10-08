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
  // If the form isn't a valid Common Form, call back with an error.
  var valid = validate.form(form)
  if (!valid) {
    // Ensure that putForm always calls back asynchronously.
    asap(function() {
      callback(new Error('Invalid form')) }) }
  else {
    // Calculate the Merkle tree for the form.
    var merkle = merkleize(form)
    var root = merkle.digest
    // Create a batch of LevelUP put operations to store the form, its
    // children, and data about the term, headings blank, and other
    // relationships within them.
    var batch = this.levelup.batch()
    addFormsToBatch(batch, form, merkle, [ ])
    addNamesToBatch(batch, form, merkle)
    // Write the batch.
    batch.write(function(error) {
      if (error) {
        callback(error) }
      else {
        // When successful, call back with the Merkle root of the form.
        callback(null, root) } }) } }

// Add put operations to a LevelUP batch to store form data, as well as
// metadata about the parents of each child form.
function addFormsToBatch(batch, form, merkle, parents) {
  // Store form data as Common Form serializes it for consistent hashing.
  var stringified = stringify(form)
  var digest = merkle.digest
  var levelKey = formKey(digest)
  batch.put(levelKey, stringified)
  // Store relations to this form's parents.
  var parentCount = parents.length
  parents
    .forEach(function(parent, index) {
      // Like other relations, the fact that one form is a parent of another is
      // stored entirely by the existence of a LevelUP key.
      var levelKey = encode([ 'parent', digest, parent, depth])
      var depth = ( parentCount - index )
      batch.put(levelKey, NO_VALUE) })
  // The parents of any child forms within this form will include this form's
  // parents, plus this form's digest.
  var childParents = parents.concat(digest)
  // Iterate the form's content, recursing for child forms.
  form.content
    .forEach(function(element, index) {
      if (isChild(element)) {
        var childForm = element.form
        var childMerkle = merkle.content[index]
        addFormsToBatch(batch, childForm, childMerkle, childParents) } }) }

function addNamesToBatch(batch, form, merkle) {
  // Generate a report about definitions, uses, etc.
  var analysis = analyze(form)
  // Add LevelUP put operations to the batch for, say, the fact that a child
  // form defines a specific term.
  meta.relations
    .forEach(function(relation) {
      var prefix = relation.prefix
      var subAnalysis = analysis[relation.analysis]
      batchRelations(batch, subAnalysis, merkle, prefix) })
  // Add LevelUP operations to the batch for, say, all the headings appearing
  // in the form, whether used to title child forms or in cross-references.
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
          // References in the commonform-analyze report to where, say, a term
          // is defined, are to the specific definition element within a form's
          // content array. Since we'ree interested in preserving metadata
          // about what form the definition appears in, and not specifically
          // where within that form, ignore the last two elements of the key
          // array (`[ "content", index ]`).
          var formKeyArray = keyArray
            .slice(0, -2)
            .filter(function(element) {
              return ( element !== 'form' ) })
          var digest = get(merkle, formKeyArray).digest
          // A relation between a form, by deigest, and a name, like
          // "Indemnification", is stored entirely by the existence of a
          // compound LevelUP key. No value is stored with it.
          var levelKey = encode([ relation, name, digest ])
          batch.put(levelKey, NO_VALUE) }) }) }

function batchKeys(batch, analysis, prefix) {
  Object.keys(analysis)
    .forEach(function(name) {
      // The fact that a name, like "Indemnification", exists in a particular
      // namespace, like "headings", is stored entirely by the existence of a
      // key in the LevelUP. No value is stored with it.
      batch.put(encode([ prefix, name ]), NO_VALUE) }) }
