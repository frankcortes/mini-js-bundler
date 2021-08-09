const t = require('@babel/types');

module.exports = function buildAllExports(source) {
  // require(source)
  const requireNode = t.callExpression(t.identifier('require'), [t.stringLiteral(source.value)]);

  // Object.entries
  const objectEntriesNode = t.memberExpression(t.identifier('Object'), t.identifier('entries'));

  // Object.entries(require(source))
  const objectEntriesCallNode = t.callExpression(objectEntriesNode, [requireNode]);

  // Object.entries(require(source)).forEach
  const forEachNode = t.memberExpression(objectEntriesCallNode, t.identifier('forEach'));

  // exports[key] = value;
  const assignFnNode = t.assignmentExpression('=', t.memberExpression(t.identifier('exports'),t.identifier('key'), true),t.identifier('value'));

  // ([key, value]) => exports[key] = value;
  const assignKeysToValuesNode = t.arrowFunctionExpression([t.arrayPattern([t.identifier('key'), t.identifier('value')])], assignFnNode);

  /**
   * The final result:
   * Object.entries(require(source)).forEach(([key, value]) => exports[key] = value)
   */
  const allExports = t.callExpression(forEachNode, [assignKeysToValuesNode]);

  return allExports;
}
