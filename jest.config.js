module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],
  testMatch: ['**/src/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/routes/**/*.js',
    'src/middleware/**/*.js',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};

