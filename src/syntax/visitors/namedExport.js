const builders = require('../builders');
const getNameOfNode = require('../getNameOfNode');

module.exports = function visitNamedExport(path) {
  const declaration = path.get('declaration');
  const nameOfNode = getNameOfNode(declaration.node, declaration.type);

  path.replaceWith(builders.namedExport(declaration.node, declaration.type));
  // After doing the named export, I want to rename all the references
  path.getAllNextSiblings().map(path => path.scope.rename(nameOfNode, `exports.${nameOfNode}`));
}
