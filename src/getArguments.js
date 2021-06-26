module.exports = function getArguments() {
  const yargs = require('yargs/yargs')(process.argv.slice(2))
  .usage('Usage: $0 [options]')
  .help()
  .detectLocale(false)
  .alias('m', 'main')
  .alias('o', 'output')
  .describe('m', 'file to bundle')
  .describe('o', 'path and file name for the generated output')
  .argv;

  return {
    main: yargs.main || yargs._[0],
    output: yargs.output || 'dist/output.js',
  };
}
