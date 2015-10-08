module.exports = streamCreatorName

function streamCreatorName(string) {
  return ( 'create' + capitalize(string) + 'Stream' ) }

function capitalize(string) {
    return ( string.charAt(0).toUpperCase() + string.slice(1) ) }
