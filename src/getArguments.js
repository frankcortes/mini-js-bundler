module.exports = function getArguments() {
  const yargs = require('yargs/yargs')(process.argv.slice(2)).argv;

  return {
    main: yargs.main || yargs._[0],
    output: yargs.output || 'dist/output.js',
  };
}
