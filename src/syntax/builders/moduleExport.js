const t = require('@babel/types');

function expresionfy(node, type) {
  if(type === 'FunctionDeclaration') {
    // Transforms this node in another type of node with the same arguments.
    return t.functionExpression(node.id, node.params, node.body, node.generator, node.async);
  }
  return node;
}

// Returns a AST node with `module.exports = nodeToExport;`
module.exports = function buildModuleExports(nodeToExport, type) {
  const moduleExportsNode = t.memberExpression(t.identifier('exports'), t.identifier('default'));
  const expressionNode = t.assignmentExpression('=', moduleExportsNode, expresionfy(nodeToExport, type));
  return t.expressionStatement(expressionNode);
}
