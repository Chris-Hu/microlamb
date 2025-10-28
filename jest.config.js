/** @type {import('ts-jest').JestConfigWithTsJest} */
//@see https://www.browserstack.com/guide/fixing-cannot-use-import-statement-outside-module-jest
export default {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleNameMapper: {
  },
  coveragePathIgnorePatterns: [
    'node_modules',
    'runner',
  ],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 30,
      lines: 50,
      statements: 50
    }
  },
  collectCoverage: true,
  moduleDirectories: ['js', 'node_modules','<rootDir>'],
  coverageDirectory: '<rootDir>/coverage/',
}

