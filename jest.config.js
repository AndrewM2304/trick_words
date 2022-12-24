// jest.config.js
const nextJest = require("next/jest");

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: "./" });

// Any custom config you want to pass to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@components/(.*)$": ["<rootDir>/src/components/$1"],
    "^@utilities/(.*)$": ["<rootDir>/types/$1"],
    "^@game/(.*)$": ["<rootDir>/game-logic/$1"],
    "^@testing/(.*)$": ["<rootDir>/testing-utilities/$1"],
    "^@public/(.*)$": ["<rootDir>/public/$1"],
  },
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig);
