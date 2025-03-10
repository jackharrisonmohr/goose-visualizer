/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",  // Change to jsdom to support browser APIs
  testMatch: ["**/tests/**/*.test.ts"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  // Transform TypeScript files
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest", 
      {
        isolatedModules: true,
      }
    ],
  },
  // Set testTimeout higher for async tests
  testTimeout: 10000,
};