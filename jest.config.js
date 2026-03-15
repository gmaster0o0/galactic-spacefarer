module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/', '/db/data/', '\\.csv$'],
};
