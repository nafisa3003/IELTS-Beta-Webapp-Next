const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  collectCoverageFrom: [
    "src/lib/services/**/*.ts",
    "src/lib/scoring/**/*.ts",
    "src/lib/validations/**/*.ts",
    "src/lib/repositories/**/*.ts",
    "!src/lib/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      lines: 50,
      branches: 50,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
