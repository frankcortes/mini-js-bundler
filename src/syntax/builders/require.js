const t = require('@babel/types');

// Returns a AST node with `const localVar = require('route');`
module.exports = function buildRequire(localvar, route) {
  const requireCall = t.callExpression(t.identifier('require'), [t.stringLiteral(route)]);
  return t.variableDeclaration('const',[t.variableDeclarator(t.identifier(localvar), requireCall)]);
}
