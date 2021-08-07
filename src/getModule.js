const { default: traverse } = require("@babel/traverse");
const parser = require("@babel/parser");
const generate = require("@babel/generator");
const fs = require("fs/promises");
const visitors = require('./syntax/visitors');

/**
 * Generates a representation of a program, with the required references, status and unique identifier.
 */
module.exports = async function getModule(fileName) {
  try {
    const content = await fs.readFile(fileName, "utf-8");
    // Everything will always be parsed as a ES module, because require syntax is
    // also possible inside of the ES modules
    const ast = parser.parse(content, {
      sourceType: "module"
    });
    const _ref = {};
    traverse(ast, {
      CallExpression(path) {
        visitors.require(path, fileName, _ref);
      },
      ImportDeclaration(path) {
        visitors.import(path, fileName, _ref);
      },
      ExportDefaultDeclaration(path) {
        visitors.defaultExport(path);
      },
      ExportNamedDeclaration(path) {
        visitors.namedExport(path);
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
