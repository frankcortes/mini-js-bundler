const { foo } = require('./b');
exports.bar = foo;
console.log('a module:');
console.log(module.exports);
