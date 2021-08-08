const builders = require('../builders');
const getNameOfNode = require('../getNameOfNode');

module.exports = function visitNamedExport(path) {
  const specifiers = path.get('specifiers');

  // Support export with specifiers
  // i.e. export { b, a as foo }
  if (specifiers.length > 0) {
    specifiers.forEach((specifier) => {
      const actualVariable = specifier.node.local.name;
      const aliasedVariable = specifier.node.exported.name;

      path.insertBefore(builders.namedAliasedExport(actualVariable, aliasedVariable));
      // After doing the named export, I want to rename all the references
      path.getAllNextSiblings().map(path => path.scope.rename(actualVariable, `exports.${aliasedVariable}`));
    });
    // Remove the parent node since it's no longer need
    path.remove();
    // Since we don't support declaration and specifiers at the same time,
    // we don't need to continue the execution.
    // i.e. export {a, const b = 3} is syntactically incorrect
    return;
  }

  // Support export with declaration
  // i.e. export const bar = 3;
  // i.e. export function x() {};
  const declaration = path.get('declaration');
  const nameOfNode = getNameOfNode(declaration.node, declaration.type);

  path.replaceWith(builders.namedExport(declaration.node, declaration.type));
  // After doing the named export, I want to rename all the references
  path.getAllNextSiblings().map(path => path.scope.rename(nameOfNode, `exports.${nameOfNode}`));
}
