const isRequire = require('../isRequire');
const getAbsolutePath = require('../../getAbsolutePath');

/**
 * Detects a require execution, replaces "require" token by a common
 * variable, and also stores all the references of the required files.
 */
module.exports = function visitRequire(path, fileName, filesToRequire) {
  if (isRequire(path)) {
    const childFileName = path.get("arguments.0").node.value;
    const actualChildFileName = getAbsolutePath(childFileName, fileName);
    filesToRequire[childFileName] = actualChildFileName;
  }
}
