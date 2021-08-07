// Given an AST node with their node type, returns the name of the node.
module.exports = function getNameOfNode(node, type) {
  if (type === 'FunctionDeclaration') {
    return node.id.name;
  }
  if (type === 'VariableDeclaration') {
    // TODO: What happens if there is more than one declaration? Is that a correct export?
    if (node.declarations.length === 1) {
      return node.declarations[0].id.name;
    }
  }

  // TODO: review other possible cases.
  return;
}
