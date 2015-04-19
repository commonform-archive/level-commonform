var Library = require('../..');
var levelup = require('levelup');
var memdown = require('memdown');

module.exports = function() {
  return new Library(levelup({db: memdown}));
};
