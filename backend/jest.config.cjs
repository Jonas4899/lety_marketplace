module.exports = {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1.js',
  },
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
};
