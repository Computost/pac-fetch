import { JestConfigWithTsJest } from "ts-jest";

export default {
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  preset: "ts-jest/presets/default",
  rootDir: "src",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [1343],
        },
        astTransformers: {
          before: [
            {
              path: "ts-jest-mock-import-meta",
              options: {
                metaObjectReplacement: {
                  url: "file:///home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/src/fetchPowerPlatformCli.ts",
                },
              },
            },
          ],
        },
      },
    ],
  },
} as JestConfigWithTsJest;
