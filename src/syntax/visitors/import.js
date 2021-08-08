const isDefaultImport = require('../isDefaultImport');
const builders = require('../builders');
const getAbsolutePath = require('../../getAbsolutePath');

/**
 * Detects a import default execution, converts "import" token into a common
 * require, and also stores all the references of the required files.
 */
module.exports = function visitImport(path, fileName, filesToRequire) {
  // TODO: only supports one default import without named declarations
  if (isDefaultImport(path)) {
    const localName =  path.get('specifiers')[0].node.local.name;
    const childFileName = path.get('source').node.value;

    // Build an identical require with babel
    path.replaceWith(builders.require(localName, childFileName));

    const actualChildFileName = getAbsolutePath(childFileName, fileName);
    filesToRequire[childFileName] = actualChildFileName;
    return;
  }
  // Doing Named imports
  // TODO: support combined named and default imports
  const specifiers = path.get('specifiers');
  const childFileName = path.get('source').node.value;
  const moduleScope = path.scope.generateUidIdentifier("scopedModule");

  // Build an identical require with babel
  path.replaceWith(builders.require(moduleScope.name, childFileName));

  // Transform specifiers to achieve live import connection
  specifiers.forEach((specifier) => {
    const aliasedVariable = specifier.node.local.name;
    const namedVariable = specifier.node.imported.name;

    path.scope.rename(aliasedVariable, `${moduleScope.name}.${namedVariable}`);
  })

  const actualChildFileName = getAbsolutePath(childFileName, fileName);
  filesToRequire[childFileName] = actualChildFileName;
}
