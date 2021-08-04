const { default: traverse } = require("@babel/traverse");
const parser = require("@babel/parser");
const generate = require("@babel/generator");
const fs = require("fs/promises");
const getAbsolutePath = require("./getAbsolutePath");
const buildRequire = require("./syntax/buildRequire");
const buildModuleExports = require('./syntax/buildModuleExports');
const isRequire = require('./syntax/isRequire');
const isDefaultImport = require('./syntax/isDefaultImport');
const { exportDefaultDeclaration } = require("@babel/types");

/**
 * Detects a require execution, replaces "require" token by a common
 * variable, and also stores all the references of the required files.
 */
function visitRequire(path, fileName, filesToRequire) {
  if (isRequire(path)) {
    const childFileName = path.get("arguments.0").node.value;
    const actualChildFileName = getAbsolutePath(childFileName, fileName);
    filesToRequire[childFileName] = actualChildFileName;
  }
}

/**
 * Detects a import default execution, converts "import" token into a common
 * require, and also stores all the references of the required files.
 */
function visitDefaultImport(path, fileName, filesToRequire) {
  if (isDefaultImport(path)) {
    const localName =  path.get('specifiers')[0].node.local.name;
    const childFileName = path.get('source').node.value;

    // Build an identical require with babel
    path.replaceWith(buildRequire(localName, childFileName));

    const actualChildFileName = getAbsolutePath(childFileName, fileName);
    filesToRequire[childFileName] = actualChildFileName;
  }
}

function visitDefaultExport(path) {
    const localName = path.get('declaration').node;
    path.replaceWith(buildModuleExports(localName));
}


/**
 * @param {String} fileName the name of the file.
 * @returns {Object|undefined} the expected babel parser configuration
 */
function getParserOptions(fileName) {
  if (fileName.endsWith('.mjs')) {
    return {
      sourceType: "module"
    };
  }
  return;
}

/**
 * Generates a representation of a program, with the required references, status and unique identifier.
 */
module.exports = async function getModule(fileName) {
  try {
    const content = await fs.readFile(fileName, "utf-8");
    const ast = parser.parse(content, getParserOptions(fileName));
    const _ref = {};
    traverse(ast, {
      CallExpression(path) {
        visitRequire(path, fileName, _ref);
      },
      ImportDeclaration(path) {
        visitDefaultImport(path, fileName, _ref);
      },
      ExportDefaultDeclaration(path) {
        visitDefaultExport(path);
      }
    });

    return {
      code: generate.default(ast, {}, content).code,
      _ref, // references of the files to be required inside code
      id: fileName, // identifier of the module.
    };
  } catch (e) {
    // In this case, the require module cannot be returned, so we will
    // return an empty module here and this will throw an error in the
    // concatenated file in execution time
    console.warn(`[WARN] ${fileName} was not found, but doing the build anyway`);
    return { id: fileName, _ref: [] };
  }
};
