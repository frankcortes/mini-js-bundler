const t = require('@babel/types');
const getNameOfNode = require('../getNameOfNode');

function getValueOfNode(node, type) {
  // TODO: check type by using isVariableDeclaration() babel utilities
  if (type === 'VariableDeclaration') {
    // TODO: What happens if there is more than one declaration? Is that a correct export?
    return node.declarations[0].init;
  }

  if(type === 'FunctionDeclaration') {
    // Transforms this node in another type of node with the same arguments.
    return t.functionExpression(node.id, node.params, node.body, node.generator, node.async);
  }

  return node;
}

// Returns a AST node with `exports[nameVariable] = nodeToExport;`
module.exports = function buildNamedExports(nodeToExport, type) {
  const namedExportsNode = t.memberExpression(t.identifier('exports'), t.identifier(getNameOfNode(nodeToExport, type)));
  const expressionNode = t.assignmentExpression('=', namedExportsNode, getValueOfNode(nodeToExport, type));
  return t.expressionStatement(expressionNode);
}
