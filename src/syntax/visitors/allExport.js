const builders = require('../builders');

// Supports re-exporting a whole module
// i.e. export * from './c.mjs';
module.exports = function(path) {
  const source = path.get('source');
  const moduleScope = path.scope.generateUidIdentifier("scopedModule");
  path.replaceWith(builders.allExport(source.node));
}
