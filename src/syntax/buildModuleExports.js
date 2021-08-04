const t = require('@babel/types');

// Returns a AST node with `module.exports = nodeToExport;`
module.exports = function buildModuleExports(nodeToExport) {
  const moduleExportsNode = t.memberExpression(t.identifier('module'), t.identifier('exports'));
  const expressionNode = t.assignmentExpression('=', moduleExportsNode, nodeToExport);
  return t.expressionStatement(expressionNode);
}
