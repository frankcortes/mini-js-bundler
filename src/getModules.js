const path = require('path');
const getModule = require("./getModule");
const getAbsolutePath = require("./getAbsolutePath");

// Generates a plain array with all the modules implied with this file, including
// the references between them via require.
module.exports = async function getModules(fileName, alreadyVisitedModules = []) {
  const absoluteFileName = path.resolve(fileName);

  // Not need to add it again, this was previously resolved.
  if (alreadyVisitedModules.includes(absoluteFileName)) {
    return [];
  }

  const mod = await getModule(absoluteFileName);
  alreadyVisitedModules.push(mod.id);

  const otherMods = await Promise.all(
    Object.keys(mod._ref).map(
      async (p) => await getModules(getAbsolutePath(p, absoluteFileName), alreadyVisitedModules)
    )
  );

  return [mod].concat(...otherMods);
}
