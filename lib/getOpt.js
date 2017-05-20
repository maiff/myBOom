var path = require('path')
var metadata = require('read-metadata')
var exists = require('fs').existsSync

module.exports = function options (dir) {
  var opts = getMetadata(dir)

  return opts
}

function getMetadata (dir) {
  var json = path.join(dir, 'meta.json')
  var opts = {}

  if (exists(json)) {
    opts = metadata.sync(json)
  }

  return opts
}