import { mkdir, writeFile } from "fs/promises";
import { platform } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  Mock,
  vi,
} from "vitest";
import fetchPowerPlatformCli from "./fetchPowerPlatformCli";
import { mockServer } from "./mock/server";
import { mockDownload, mockPackageMetadata } from "./nuget/mock";
import specifications, { OperatingSystem } from "./specifications";
import Config from "./types/Config";
import Options from "./types/Options";
import { createZipFile, getDirectoryContents } from "./unzip/mock";
import FileSystem from "./unzip/mock/FileSystem";
import inOneLine from "./util/inOneLine";

const now = new Date(2000, 0, 1);
const expiry = now.getTime() + 60 * 60 * 1000;

const packages = (
  await Promise.all(
    specifications.map(async ({ os }) => {
      const toolsDirectory = {
        "Azure.Core.dll": "Azure Core assembly",
        [`pac${os === "windows" ? ".exe" : ""}`]: "Pac executable",
      };
      const nugetPackage = await createZipFile({
        LICENSE: "This is a license file",
        tools: toolsDirectory,
      });
      return { [os]: { toolsDirectory, nugetPackage } };
    })
  )
).reduce((packages, entry) => ({ ...packages, ...entry }), {}) as unknown as {
  [os in OperatingSystem]: {
    toolsDirectory: FileSystem;
    nugetPackage: Buffer;
  };
};

vi.mock("os");
vi.mock("url");

beforeAll(async () =>
  mockServer(
    ...specifications.flatMap(({ os, id }) => [
      mockPackageMetadata(id, {
        items: [
          {
            items: [{ catalogEntry: { version: "1.0.0" } }],
            upper: "1.0.0",
          },
        ],
      }),
      mockDownload(id, "1.0.0", packages[os].nugetPackage),
    ])
  )
);
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe("fetchPowerPlatformCli", () => {
  it('throws an error when "all" and "operatingSystem" are both specified', async () => {
    await expect(
      fetchPowerPlatformCli({ all: true, operatingSystem: "linux" })
    ).rejects.toThrowError(
      'Conflicting options: cannot specify both "operatingSystem" and "all."'
    );
  });

  it('throws an error when "operatingSystem" is set to an unrecognized value', async () => {
    await expect(
      fetchPowerPlatformCli({ operatingSystem: "window" } as unknown as Options)
    ).rejects.toThrow("Unrecognized operating system: window");
  });

  it("throws an error when pac-fetch.config is not a valid JSON file", async () => {
    const binPath = join(mockFileToURL(), "bin");
    await mkdir(binPath, { recursive: true });
    await writeFile(join(binPath, "pac-fetch.json"), "{");

    await expect(fetchPowerPlatformCli()).rejects.toThrowError(
      "Unexpected end of JSON input"
    );
  });

  specifications.forEach((spec) => {
    describe(`operating system: ${spec.os}`, () => {
      it(
        inOneLine`
          when run under the default configuration,
            saves pac tools to "bin" folder in package directory`,
        async () => {
          (platform as Mock).mockReturnValue(spec.platform);
          const expectedPath = join(mockFileToURL(), "bin");
          vi.setSystemTime(now);

          const pacPath = await fetchPowerPlatformCli();

          expect(pacPath).toEqual(expectedPath);
          expect(await getFetchResult(pacPath)).toEqual({
            directoryContents: packages[spec.os].toolsDirectory,
            config: {
              expiry,
              operatingSystems: { [spec.os]: "1.0.0" },
              version: "latest",
            },
          });
        }
      );

      it('when provided as "operatingSystem", downloads pac for the provided operating system', async () => {
        mockFileToURL();
        vi.setSystemTime(now);

        const pacPath = await fetchPowerPlatformCli({
          operatingSystem: spec.os,
        });

        expect(await getFetchResult(pacPath)).toEqual({
          directoryContents: packages[spec.os].toolsDirectory,
          config: {
            expiry,
            operatingSystems: { [spec.os]: "1.0.0" },
            version: "latest",
          },
        });
      });
    });
  });

  it('when "all" is true, downloads the pac runtime for each operating system', async () => {
    vi.setSystemTime(now);

    const pacPath = await fetchPowerPlatformCli({ all: true });

    expect(await getFetchResult(pacPath)).toEqual({
      directoryContents: specifications.reduce(
        (contents, { os }) => ({
          ...contents,
          [os]: packages[os].toolsDirectory,
        }),
        {}
      ),
      config: {
        expiry,
        operatingSystems: specifications.reduce(
          (dict, { os }) => ({ ...dict, [os]: "1.0.0" }),
          {}
        ),
        version: "latest",
      },
    });
  });

  it(`when pac has been fetched less than an hour ago with the same config, `, () => {});
});

function mockFileToURL() {
  const fetchPowerPlatformCliTsPath =
    "/home/user/.npm/_npx/hash/node_modules/.bin/pac-fetch/src/fetchPowerPlatformCli.ts";
  (fileURLToPath as Mock).mockReturnValue(fetchPowerPlatformCliTsPath);
  return join(dirname(fetchPowerPlatformCliTsPath), "..");
}

async function getFetchResult(
  path: string
): Promise<{ directoryContents: FileSystem; config: Config }> {
  const directoryContents = await getDirectoryContents(path);
  const config = JSON.parse(directoryContents["pac-fetch.json"] as string);
  delete directoryContents["pac-fetch.json"];
  return {
    directoryContents,
    config,
  };
}
