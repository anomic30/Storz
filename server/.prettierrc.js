const eslintConfig = require('./.eslintrc');

// When linting and formatting was tested, there was inconsistency with eslint and prettier
// Both demands that prettier rules exist on both config files (.eslintrc.js and .prettierrc.js)
// So, in other to maintain the same configuration and let be defined on file, .eslintrc was imported here

const prettierRules = eslintConfig.rules['prettier/prettier'][1];

module.exports = prettierRules;