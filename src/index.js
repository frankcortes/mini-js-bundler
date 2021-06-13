const md5 = require("crypto-js/md5");
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
  if (alreadyVisitedModules.includes(`_${md5(absoluteFileName)}`)) {
    return [];
  }

  const mod = await getModule(absoluteFileName);
  alreadyVisitedModules.push(mod.id);

  // TODO: This only works with requires without extension, i.e. require('./a')
  const otherMods = await Promise.all(
    Object.keys(mod._ref).map(
      async (p) => await getModules(getAbsolutePath(p, absoluteFileName), alreadyVisitedModules)
    )
  );

  return [mod].concat(...otherMods);
}

async function main() {
  try {
    const modules = await getModules("./tests/same-dep-twice/a.js");

    // At this point, every module was calculated via DFS algorithm.
    // TODO: avoid duplicate references.
    fs.writeFile("./dist/output.js", getStringifiedFile(modules), "utf-8");
  } catch (e) {
    console.log(e);
  }
}

main();
