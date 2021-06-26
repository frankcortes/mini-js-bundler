const fs = require("fs/promises");
const getModules = require('./getModules');
const getStringifiedFile = require("./getStringifiedFile");
const getArguments = require('./getArguments');

async function main() {

  const args = getArguments();

  try {
    const modules = await getModules(args.main);

    // At this point, every module was calculated via DFS algorithm.
    fs.writeFile("./dist/output.js", getStringifiedFile(modules), "utf-8");
  } catch (e) {
    console.log(e);
  }
}

main();
