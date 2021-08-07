const fs = require("fs/promises");
const getModules = require('./getModules');
const getStringifiedFile = require("./getStringifiedFile");
const getArguments = require('./getArguments');

async function main() {

  const args = getArguments();

  try {
    const modules = await getModules(args.main);
    const areESmodules = args.main.endsWith('.mjs');

    // At this point, every module was calculated via DFS algorithm.
    fs.writeFile(args.output, getStringifiedFile(modules, areESmodules), "utf-8");
  } catch (e) {
    console.log(e);
  }
}

main();
