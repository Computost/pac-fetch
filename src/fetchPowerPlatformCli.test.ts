import mockFs from "mock-fs";
import { setupServer } from "msw/node";
import { fileURLToPath } from "url";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vi,
} from "vitest";
import fetchPowerPlatformCli from "./fetchPowerPlatformCli";
import { mockDownload, mockPackageMetadata } from "./nuget/mock";
import specifications, { OperatingSystem } from "./specifications";
import { createZipFile, getDirectoryContents } from "./unzip/mock";
import FileSystem from "./unzip/mock/FileSystem";

vi.mock("url", () => ({
  fileURLToPath: vi.fn(),
}));

const toolsDirectories: { [key in OperatingSystem]: FileSystem } =
  specifications.reduce(
    (directories, spec) => ({
      ...directories,
      [spec.os]: {
        "Azure.Core.dll": "Azure Core assembly",
        [`pac${spec.os === "windows" ? ".exe" : ""}`]: "Pac executable",
      },
    }),
    {}
  ) as { [key in OperatingSystem]: FileSystem };
const server = setupServer(
  ...(
    await Promise.all(
      specifications.map(async ({ id, os }) => [
        mockPackageMetadata(id, {
          items: [
            { items: [{ catalogEntry: { version: "1" } }], upper: "1.0.0" },
          ],
        }),
        mockDownload(
          id,
          "1.0.0",
          await createZipFile({
            LICENSE: "This is a license file",
            tools: toolsDirectories[os],
          })
        ),
      ])
    )
  ).flat()
);
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
  mockFs.restore();
});

describe("fetchPowerPlatformCli", () => {
  [specifications.find((spec) => spec.os === "linux")!].forEach((spec) => {
    it(`Default options (${spec.os})`, async () => {
      (fileURLToPath as Mock).mockReturnValue(
        "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/src/fetchPowerPlatformCli.ts"
      );
      mockFs();

      const pacPath = await fetchPowerPlatformCli();

      expect(pacPath).toEqual(
        "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/bin"
      );
      expect(
        await getDirectoryContents(
          "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/bin"
        )
      ).toEqual(toolsDirectories[spec.os]);
    });
  });
});
