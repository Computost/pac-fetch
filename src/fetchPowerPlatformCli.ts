import { chmod, readFile, rm, writeFile } from "fs/promises";
import { platform } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import areArraysEqual from "./areArraysEqual.js";
import inOneLine from "./inOneLine.js";
import specifications, { OperatingSystem } from "./specifications.js";
import unzip from "./unzip.js";

export default async function fetchPowerPlatformCli(options?: Options) {
  if (options?.all && options?.operatingSystem) {
    throw new Error(
      'Conflicting options: cannot specify both "operatingSystem" and "all."'
    );
  }

  const operatingSystems = options?.all
    ? specifications.map((spec) => spec.os)
    : [
        (() => {
          if (!options?.operatingSystem) {
            return;
          }
          if (
            !specifications.some((spec) => spec.os === options.operatingSystem)
          ) {
            throw new Error(
              `Unrecognized operating system: ${options.operatingSystem}`
            );
          }
          return options.operatingSystem;
        })() ??
          (() => {
            const plat = platform();
            const spec = specifications.find(
              (spec) => spec.platform === platform()
            );
            if (!spec) {
              throw new Error(`Unrecognized platform: ${plat}`);
            }
            return spec.os;
          })(),
      ];

  const version = options?.version ?? "latest";

  const packagePath =
    options?.path ??
    (function getDefaultPath() {
      const thisFilePath = fileURLToPath(import.meta.url);
      const packageDirectory = join(dirname(thisFilePath), "..");
      return join(packageDirectory, "bin");
    })();
  const configPath = join(packagePath, "pac-fetch.json");
  const config = await (async function getConfig(): Promise<Config> {
    try {
      return JSON.parse((await readFile(configPath)).toString());
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {};
      }
      throw error;
    }
  })();

  const now = new Date().getTime();
  if (options?.force) {
    options.log?.('"force" detected in options. Fetching pac.');
  } else if (
    (function optionsMatchConfig() {
      return (
        areArraysEqual(
          Object.keys(config.operatingSystems ?? {}),
          operatingSystems
        ) && config.version === version
      );
    })()
  ) {
    if (config.version === "latest") {
      if (config.expiry) {
        const currentDownloadedPacVersion = inOneLine`
          Current downloaded pac version
          ${
            config.operatingSystems
              ? `(${(function getVersionList() {
                  const uniqueVersions = new Set<string>(
                    Object.values(config.operatingSystems)
                  );
                  return uniqueVersions.size === 1
                    ? uniqueVersions.values().next().value
                    : Object.keys<OperatingSystem>(config.operatingSystems)
                        .map((os) => `${os}: ${config.operatingSystems![os]}`)
                        .join(", ");
                })()})`
              : ""
          }
        `;
        if (config.expiry > now) {
          options?.log?.(
            inOneLine`
              ${currentDownloadedPacVersion} has not expired. Will check for the
                latest version after ${new Date(config.expiry).toISOString()}.
              Skipping pac-fetch.
            `
          );
          return;
        } else {
          options?.log?.(
            inOneLine`
              ${currentDownloadedPacVersion} has expired.
              Checking latest version.
            `
          );
        }
      } else {
        options?.log?.(
          "No expiration date found in config. Checking latest version."
        );
      }
    } else {
      options?.log?.(
        inOneLine`
          Options match config and specify version "${version}," which is
            currently downloaded.
          Skipping pac-fetch.
        `
      );
      return;
    }
  }

  /// TODO: Don't do this until we've determined we need to download latest versions
  const rmDirPromise = rm(packagePath, { recursive: true, force: true });

  const multiOs = operatingSystems.length > 1;
  const downloadedVersions = (
    await Promise.all<{ os: OperatingSystem; version: string }>(
      operatingSystems.map(async (os) => {
        const log = (...data: any[]) => {
          if (!options?.log) {
            return;
          }
          if (multiOs) {
            options.log(`${os}:`, ...data);
          } else {
            options.log(...data);
          }
        };

        const id = specifications.find((spec) => spec.os === os)!.id;

        const osVersion =
          version === "latest"
            ? await (async function getOsVersion() {
                const response = await fetch(
                  `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`
                );
                const packageIndex =
                  (await response.json()) as NugetPackageIndex;
                return packageIndex.items[0].upper;
              })()
            : version;

        if (!options?.force && osVersion === config.operatingSystems?.[os]) {
          log(`Already have latest version ${osVersion}. Skipping fetch.`);
          return { os, version: osVersion };
        }

        log(`Downloading ${id} version ${osVersion}.`);
        const buffer = await (async function getBuffer() {
          const response = await fetch(
            `https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${osVersion}/${id.toLowerCase()}.${osVersion}.nupkg`
          );
          const buffer = await response.arrayBuffer();
          return buffer;
        })();
        log("Download complete.");
        await rmDirPromise;
        const targetDirectory = multiOs ? join(packagePath, os) : packagePath;
        log(`Extracting to ${targetDirectory}`);
        await unzip(buffer, targetDirectory, {
          include: /^tools\//,
          pathTransformer: (path) => path.replace(/^tools\//, ""),
        });
        log("Extraction complete");
        const executableName = os === "windows" ? "pac.exe" : "pac";
        await chmod(join(targetDirectory, executableName), 0x777);
        log(`Granted execute permissions on ${executableName}.`);
        return { os, version: osVersion };
      })
    )
  ).reduce((current, { os, version }) => ({ ...current, [os]: version }), {});

  await writeFile(
    configPath,
    JSON.stringify({
      expiry: now + 60 * 60 * 1000,
      operatingSystems: downloadedVersions,
      version,
    } as Config)
  );

  return packagePath;
}

interface Options {
  all?: boolean;
  operatingSystem?: OperatingSystem;
  path?: string;
  version?: string;
  force?: boolean;
  log?: (...data: any[]) => void;
}

type Config = {
  expiry?: number;
  operatingSystems?: {
    [key in OperatingSystem]?: string;
  };
  version?: string;
};

type NugetPackageIndex = {
  items: { upper: string }[];
};
