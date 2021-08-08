const builders = require('../builders');
const getAbsolutePath = require('../../getAbsolutePath');

/**
 * Detects a import default execution, converts "import" token into a common
 * require, and also stores all the references of the required files.
 */
module.exports = function visitImport(path, fileName, filesToRequire) {
  const specifiers = path.get('specifiers');
  const childFileName = path.get('source').node.value;
  const moduleScope = path.scope.generateUidIdentifier("scopedModule");

  // Build an identical require with babel
  path.replaceWith(builders.require(moduleScope.name, childFileName));

  // Transform specifiers to achieve live import connection
  specifiers.forEach((specifier) => {
    const aliasedVariable = specifier.node.local.name;
    let namedVariable;

    if (specifier.type === 'ImportDefaultSpecifier') {
      namedVariable = 'default';
    } else {
      namedVariable = specifier.node.imported.name;
    }

    path.scope.rename(aliasedVariable, `${moduleScope.name}.${namedVariable}`);
  })

  const actualChildFileName = getAbsolutePath(childFileName, fileName);
  filesToRequire[childFileName] = actualChildFileName;
}
