var relationship = require('./relationship');

module.exports = function amplifyBookmark(bookmark, digest) {
  return relationship(
    bookmark,
    'references',
    digest,
    0,
    ' '
  );
};
