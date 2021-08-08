const builders = require('../builders');

module.exports = function visitDefaultExport(path) {
  const declaration = path.get('declaration');
  path.replaceWith(builders.moduleExport(declaration.node, declaration.type));
}
