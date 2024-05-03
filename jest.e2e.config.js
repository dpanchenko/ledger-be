// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultConfig = require('./jest.unit.config');

const config = {
  ...defaultConfig,
  testRegex: '.*\\.e2e-spec\\.ts$',
};

module.exports = config;
