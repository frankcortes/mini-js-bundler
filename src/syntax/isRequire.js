// Given a AST callFunction node, returns true if is `require()`
module.exports = function isRequire(path) {
  return path.get("callee").isIdentifier({ name: "require" })
}
