const stringifyPackage = require('stringify-package')
const detectIndent = require('detect-indent')
const detectNewline = require('detect-newline')

module.exports.readVersion = function(contents) {
  return JSON.parse(contents).peerDependencies['ngx-google-maps-places-api'];
};

module.exports.writeVersion = function(contents, version) {
  const json = JSON.parse(contents);
  let indent = detectIndent(contents).indent;
  let newline = detectNewline(contents);
  json.version = version;
  json.peerDependencies['ngx-google-maps-places-api'] = "^" + version;
  return stringifyPackage(json, indent, newline);
};
