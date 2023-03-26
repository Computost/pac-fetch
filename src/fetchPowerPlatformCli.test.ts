import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { FetchMockStatic } from "fetch-mock";
import mockFs from "mock-fs";
import fetchPowerPlatformCli from "./fetchPowerPlatformCli.js";
import { mockDownload, mockPackageMetadata } from "./nuget/mock/index.js";
import specifications from "./specifications.js";
import { createZipFile, getDirectoryContents } from "./unzip/mock/index.js";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock: FetchMockStatic = require("node-fetch");
beforeEach(() => {
  fetchMock.reset();
  mockFs();
});
afterEach(() => {
  mockFs.restore();
});

describe("fetchPowerPlatformCli", () => {
  [specifications.find((spec) => spec.os === "linux")!].forEach((spec) => {
    test(`Default options (${spec.os})`, async () => {
      mockPackageMetadata(fetchMock, spec.id, {
        items: [{ items: [], upper: "1.0.0" }],
      });
      const toolsDirectory = {
        "Azure.Core.dll": "Azure Core assembly",
        [`pac${spec.os === "windows" ? ".exe" : ""}`]: "Pac executable",
      };
      const nugetPackage = await createZipFile({
        LICENSE: "This is a license file",
        tools: toolsDirectory,
      });
      mockDownload(fetchMock, spec.id, "1.0.0", nugetPackage);

      const pacPath = await fetchPowerPlatformCli();

      expect(pacPath).toEqual(
        "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/bin"
      );
      expect(
        await getDirectoryContents(
          "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/bin"
        )
      ).toEqual(toolsDirectory);
    });
  });
});
