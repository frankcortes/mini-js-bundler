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

// This is an special module for ES modules.
// We need to avoid the execution of the modules before being fullfilled,
// so we did this hack for supporting the require() algorithm.
function getNoopModule() {
  return `
  __modules__['noop'] = {}; \n
  Object.defineProperties(__modules__['noop'], {\n
    code: {\n
      value: (function() {}),\n
    },\n
    _ref: {\n
    },\n
    exports: {\n
      value: {},\n
      writable: true, \n
    },\n
    id: {\n
      value: 'noop',\n
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

function getStringifiedModules(modules, areESmodules) {
  // TODO: This is executed here since it's doing a side effect which is to remove circular imports (in the ES modules case). Maybe not the best way to modify the modules :D
  let initialization = getStringifiedInitialization(modules, areESmodules);

  return `const __modules__ = {};\n\n${modules
    .map(getStringifiedModule)
    .join("")};\n\n${initialization}`;
}

// executes first the dependencies, and then the main module in a DFS algorithm.
// Notice that the object keys with the references are sorted by ocurrence order.
// Notice we avoid to execute again the already visited nodes.
function getESModulesInitialization(modules, currentModule = modules[0]) {
  currentModule.wasExecuted = true;
  const previousExecutions = Object.entries(currentModule._ref).reduce((total, [localRef, reference]) => {
    const referencedModule = modules.find(({ id }) => id === reference);
    if (!referencedModule.wasExecuted) {
      return `${total}${getESModulesInitialization(modules, referencedModule)}`;
    }
    // This is an special case where we want to keep the import() execution but at
    // the same time we don't want to execute anything, so we have an special
    // module for that
    if(!referencedModule.wasFinished) {
      currentModule._ref[localRef] = 'noop';
    }
    return total;
  },'');

  currentModule.wasFinished = true;

  return `${previousExecutions}execModule('${currentModule.id}');\n\n`;
}

// This executes the "main" module. Notice that the array is sorted by order of execution.
function getRequireModulesInitialization(modules) {
  return `execModule('${modules[0].id}');\n\n`;
}


function getStringifiedInitialization(modules, areESmodules) {
  if (areESmodules) {
    return `${getNoopModule()}${getESModulesInitialization(modules)}`;
  }

  return getRequireModulesInitialization(modules);
}

module.exports = function getStringifiedFile(modules, areESmodules) {
  return `${execModule.toString()}\n\n${getRequireForModule.toString()}\n\n${getStringifiedModules(
    modules, areESmodules
  )}\n\n;`
}
