require('tsx/cjs');

const serviceModule = require('./spacefarer.service.ts');

module.exports = serviceModule.default;
module.exports.validateAndEnhanceSpacefarer = serviceModule.validateAndEnhanceSpacefarer;
