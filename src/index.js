const fs = require("fs/promises");
const path = require('path');
const getModule = require("./getModule");
const getStringifiedFile = require("./getStringifiedFile");
const getAbsolutePath = require("./getAbsolutePath");

// Generates a plain array with all the modules implied with this file, including
// the references between them via require.
async function getModules(fileName, alreadyVisitedModules = []) {
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

async function main() {
  try {
    const modules = await getModules("./tests/use-module-to-export/a.js");

    // At this point, every module was calculated via DFS algorithm.
    fs.writeFile("./dist/output.js", getStringifiedFile(modules), "utf-8");
  } catch (e) {
    console.log(e);
  }
}

main();
