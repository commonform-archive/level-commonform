module.exports = LevelCommonForm

var asap = require('asap')
var validate = require('commonform-validate')
var merkleize = require('commonform-merkleize')

function LevelCommonForm(levelup) {
  if (!(this instanceof LevelCommonForm)) {
    return new LevelCommonForm(levelup) }
  this.levelup = levelup }

var prototype = LevelCommonForm.prototype

prototype.getForm = function(digest, callback) {
  this.levelup.get(digest, function(error, json) {
    if (error) {
      callback(error) }
    else {
      var form = JSON.parse(json)
      callback(null, form) } }) }

prototype.putForm = function(form, callback) {
  var valid = validate.form(form)
  if (!valid) {
    asap(function() {
      callback(new Error('Invalid form')) }) }
  else {
    var merkle = merkleize(form)
    var digest = merkle.digest
    var json = JSON.stringify(form)
    this.levelup.put(digest, json, function(error) {
      if (error) {
        callback(error) }
      else {
        callback(null, digest) } }) } }

prototype.createDigestStream = function() {
  return this.levelup.createKeyStream() }
