import { readFile, rm } from "fs/promises";
import { platform, version } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import areArraysEqual from "./areArraysEqual.js";
import fetchAllPlatforms from "./fetchAllPlatforms.js";
import fetchCurrentPlatform from "./fetchCurrentPlatform.js";
import inOneLine from "./inOneLine.js";
import specifications, { OperatingSystem } from "./specifications.js";

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
                  uniqueVersions.size === 1
                    ? uniqueVersions.values().next().value
                    : Object.keys<OperatingSystem>(config.operatingSystems)
                        .map((os) => `${os}: ${config.operatingSystems![os]}`)
                        .join(", ");
                })()}`
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

  const rmDirPromise = rm(packagePath, { recursive: true });

  const versionToDownload =
    version === "latest"
      ? await (async function getLatestVersion() {})()
      : version;

  if (options?.all) {
    await fetchAllPlatforms(packagePath, options.version);
  } else {
    await fetchCurrentPlatform(packagePath, appendOs, options?.version);
  }
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
