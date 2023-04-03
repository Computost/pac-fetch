import { platform } from "os";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from "vitest";
import fetchPowerPlatformCli from "./fetchPowerPlatformCli";
import { mockServer } from "./mock/server";
import { mockDownload, mockPackageMetadata } from "./nuget/mock";
import specifications from "./specifications";
import { createZipFile, getDirectoryContents } from "./unzip/mock";

vi.mock("os");
vi.mock("url");

describe("fetchPowerPlatformCli", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  specifications.forEach((spec) => {
    it(`Default options (${spec.os})`, async () => {
      const toolsDirectory = {
        "Azure.Core.dll": "Azure Core assembly",
        [`pac${spec.os === "windows" ? ".exe" : ""}`]: "Pac executable",
      };
      const nugetPackage = await createZipFile({
        LICENSE: "This is a license file",
        tools: toolsDirectory,
      });
      mockServer(
        mockPackageMetadata(spec.id, {
          items: [
            { items: [{ catalogEntry: { version: "1.0.0" } }], upper: "1.0.0" },
          ],
        }),
        mockDownload(spec.id, "1.0.0", nugetPackage)
      );
      (platform as Mock).mockReturnValue(spec.platform);
      (fileURLToPath as Mock).mockReturnValue(
        "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/src/fetchPowerPlatformCli.ts"
      );
      const now = new Date(2000, 0, 1);
      vi.setSystemTime(now);

      const pacPath = await fetchPowerPlatformCli();

      expect(pacPath).toEqual(
        "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/bin"
      );
      const directoryContents = await getDirectoryContents(
        "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/bin"
      );

      const pacFetchConfig = JSON.parse(
        directoryContents["pac-fetch.json"] as string
      );
      delete directoryContents["pac-fetch.json"];
      expect(directoryContents).toEqual(toolsDirectory);
      expect(pacFetchConfig).toEqual({
        expiry: now.getTime() + 60 * 60 * 1000,
        operatingSystems: { [spec.os]: "1.0.0" },
        version: "latest",
      });
    });
  });
});
