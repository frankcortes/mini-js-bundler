/**
 * Scopes the program inside of a function that overrides the meaning of require and exports, so we don't have to change the code. Also exposes the references in the requires and creates a exports object.
 */
function getStringifiedModule({ code, _ref, id }) {
  // This is the case for not-resolved modules, we don't have to add
  // anything here.
  if (!code) {
    return;
  }
  // Create a read-only object except the exports property
  return `
    __modules__['${id}'] = {}; \n
    Object.defineProperties(__modules__['${id}'], {\n
      code: {\n
        value: (function(require, exports, module){\n${code}\n}),\n
      },\n
      _ref: {\n
        value: ${JSON.stringify(_ref)},\n
      },\n
      exports: {\n
        value: {},\n
        writable: true, \n
      },\n
      id: {\n
        value: '${id}',\n
      },\n
    });\n\n`
}

// This method overrides the original require for each module.
function getRequireForModule(moduleId) {
  return function requireForModule(path) {
    const requiredModuleId = __modules__[moduleId]._ref[path];
    const requiredModule = __modules__[requiredModuleId];

    // The module does not exist, we throw an error.
    if (!requiredModule) {
      throw Error(`Cannot find module '${path}'`);
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
  requiredModule.code(getRequireForModule(moduleId), requiredModule.exports, requiredModule);
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
