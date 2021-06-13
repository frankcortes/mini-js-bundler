/**
 * Scopes the program inside of a function that overrides the meaning of require and exports, so we don't have to change the code. Also exposes the references in the requires and creates a exports object.
 */
function getStringifiedModule({ code, _ref, id }) {
  return `__modules__['${id}'] = {
    code: (function(require, exports){\n${code}\n}),\n
    _ref: ${JSON.stringify(_ref)},\n
    exports: {},\n
  };\n`;
}

// This method overrides the original require for each module.
function getRequireForModule(moduleId) {
  return function requireForModule(path) {
    const requiredModuleId = __modules__[moduleId]._ref[path];
    const requiredModule = __modules__[requiredModuleId];

    // The module does not exist, we return an empty object.
    if (!requiredModule) {
      return {};
    }

    // First time we required we have to execute it and assure this is not going to be
    // executed again
    if (!requiredModule.wasExecuted) {
      execModule(requiredModuleId);
    }

    return requiredModule.exports;
  };
}

// Executes a module with the expected `require` and `exports` and marks it as executed.
function execModule(moduleId) {
  const requiredModule = __modules__[moduleId];
  requiredModule.wasExecuted = true;
  requiredModule.code(getRequireForModule(moduleId), requiredModule.exports);
}

function getStringifiedModules(modules) {
  return `const __modules__ = {};\n\n${modules
    .map(getStringifiedModule)
    .join("")};`;
}

// This executes the "main" module. Notice that the array is sorted by order of execution.
function getStringifiedInitialization(modules) {
  return `execModule('${modules[0].id}');\n\n`;
}

module.exports = function getStringifiedFile(modules) {
  return `${execModule.toString()}\n\n${getRequireForModule.toString()}\n\n${getStringifiedModules(
    modules
  )}\n\n${getStringifiedInitialization(modules)}`;
};
