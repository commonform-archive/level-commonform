// The collission detection test is in a separate test suite run by a
// separate test runner because it clobbers require() to mock
// commonform-hash and fake a hash collission. Doing that in shared
// scope with other mocha suites produced unexpected results.
var test = require('tap').test;
var deepEql = require('deep-eql');
var levelup = require('levelup');
var memdown = require('memdown');
var mockery = require('mockery');

test('Hash Collissions', function(t) {
  t.plan(1);

  var a = {content:['A']};
  var b = {content:['B']};
  var digest = new Array(65).join('9');
  // Mock hash function that products the same digest for a and b.
  var mockHash = function(form) {
    if (deepEql(form, a) || deepEql(form, b)) {
      return digest;
    }
  };

  mockery.enable({warnOnUnregistered: false});
  mockery.registerMock('commonform-hash', mockHash);

  var library = new require('../..')(levelup({db: memdown}));
  library.createFormsWriteStream().end(a, function() {
    library.createFormsWriteStream()
      .on('error', function(error) {
        t.equals(
          error.message, 'Hash collission',
          'error message should be "Hash collission"'
        );
      })
      .end(b, function() {
        mockery.disable();
      });
  });
});
