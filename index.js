module.exports = LevelCommonForm

var asap = require('asap')
var isChild = require('commonform-predicate').child
var merkleize = require('commonform-merkleize')
var validate = require('commonform-validate')

function LevelCommonForm(levelup) {
  if (!(this instanceof LevelCommonForm)) {
    return new LevelCommonForm(levelup) }
  this.levelup = levelup }

var prototype = LevelCommonForm.prototype

prototype.getForm = function(digest, callback) {
  this.levelup.get(digest, function(error, json) {
    if (error) {
      if (error.notFound) {
        callback() }
      else {
        callback(error) } }
    else {
      var form = JSON.parse(json)
      callback(null, form) } }) }

function addToBatch(batch, form, merkle) {
  var json = JSON.stringify(form)
  batch.put(merkle.digest, json)
  form.content.forEach(function(element, index) {
    if (isChild(element)) {
      var childForm = element.form
      var childMerkle = merkle.content[index]
      addToBatch(batch, childForm, childMerkle) } }) }

prototype.putForm = function(form, callback) {
  var valid = validate.form(form)
  if (!valid) {
    asap(function() {
      callback(new Error('Invalid form')) }) }
  else {
    var merkle = merkleize(form)
    var root = merkle.digest
    var batch = this.levelup.batch()
    addToBatch(batch, form, merkle)
    batch.write(function(error) {
      if (error) {
        callback(error) }
      else {
        callback(null, root) } }) } }

prototype.createDigestStream = function() {
  return this.levelup.createKeyStream() }
