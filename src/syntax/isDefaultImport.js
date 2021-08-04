// Given a AST ImportDeclaration node, returns true if is `import a from ...`
module.exports = function isDefaultImport(path) {
  const specifiers =  path.get('specifiers');
  return specifiers.length === 1 && specifiers[0].type === 'ImportDefaultSpecifier';
}
