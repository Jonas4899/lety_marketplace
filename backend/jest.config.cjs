module.exports = {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1.js',
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
};
