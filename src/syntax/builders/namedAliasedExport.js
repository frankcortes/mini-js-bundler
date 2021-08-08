const t = require('@babel/types');

// Returns a AST node with `exports[aliasedName] = actualName;`
module.exports = function buildNamedExports(actualName, aliasedName) {
  const namedExportsNode = t.memberExpression(t.identifier('exports'), t.identifier(aliasedName));
  const expressionNode = t.assignmentExpression('=', namedExportsNode, t.identifier(actualName));
  return t.expressionStatement(expressionNode);
}
