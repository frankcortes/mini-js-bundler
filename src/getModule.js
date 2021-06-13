const { default: traverse } = require("@babel/traverse");
const parser = require("@babel/parser");
const fs = require("fs/promises");
const md5 = require("crypto-js/md5");
const getAbsolutePath = require("./getAbsolutePath");

/**
 * Detects a require execution, replaces "require" token by a common
 * variable, and also stores all the references of the required files.
 */
function visitRequire(path, fileName, filesToRequire) {
  const isRequire = path.get("callee").isIdentifier({ name: "require" });
  if (isRequire) {
    const childFileName = path.get("arguments.0").node.value;
    const actualChildFileName = getAbsolutePath(childFileName, fileName);
    filesToRequire[childFileName] = `_${md5(actualChildFileName)}`;
  }
}

/**
 * Generates a representation of a program, with the required references, status and unique identifier.
 */
module.exports = async function getModule(fileName) {
  try {
    const content = await fs.readFile(fileName, "utf-8");
    const ast = parser.parse(content);
    const id = `_${md5(fileName)}`;
    const _ref = {};
    traverse(ast, {
      CallExpression(path) {
        visitRequire(path, fileName, _ref);
      },
    });

    return {
      code: content,
      _ref, // references of the files to be required inside code
      id, // identifier of the module.
    };
  } catch (e) {
    console.log(e);
    throw Error(`Module ${fileName} was not loaded.`);
  }
};
