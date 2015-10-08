module.exports = function streamCreatorName(string) {
  return (
    'create' +
    string.charAt(0).toUpperCase() +
    string.slice(1) +
    'Stream' ) }

