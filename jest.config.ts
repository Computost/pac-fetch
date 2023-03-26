import { JestConfigWithTsJest } from "ts-jest";

export default {
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: "ts-jest/presets/default",
  rootDir: "src",
  testEnvironment: "node",
} as JestConfigWithTsJest;
