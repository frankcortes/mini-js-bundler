const path = require("path");

module.exports = function getAbsolutePath(p, parent) {
  return path.resolve(path.dirname(parent), `${p}.js`);
};
