const path = require("path");

function getNormalizedRoute(route) {
  if(route.endsWith('.js')) {
    return route;
  }
  return `${route}.js`;
}

module.exports = function getAbsolutePath(route, parent) {
  return path.resolve(path.dirname(parent), getNormalizedRoute(route));
};
