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
    let renamedVariable;

    if (specifier.type === 'ImportDefaultSpecifier') {
      namedVariable = 'default';
    } else if (specifier.type !== 'ImportNamespaceSpecifier') {
      namedVariable = specifier.node.imported.name;
    }

    if (namedVariable) {
      renamedVariable = `${moduleScope.name}.${namedVariable}`;
    } else {
      // This is for the module namespaced specifier case, returns
      // the whole module
      renamedVariable = moduleScope.name;
    }

    path.scope.rename(aliasedVariable, renamedVariable);
  })

  const actualChildFileName = getAbsolutePath(childFileName, fileName);
  filesToRequire[childFileName] = actualChildFileName;
}
