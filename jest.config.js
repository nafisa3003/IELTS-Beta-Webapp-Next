const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  collectCoverageFrom: [
    "src/lib/services/assessment-service.ts",
    "src/lib/services/course-service.ts",
    "src/lib/scoring/strategy.ts",
    "src/lib/validations/auth.ts",
    "src/lib/validations/profile.ts",
    "src/lib/repositories/user.repository.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 50,
      branches: 50,
    },
  },
};

module.exports = createJestConfig(customJestConfig);