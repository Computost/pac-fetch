import { readFile } from "fs/promises";
import { platform, version } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import areArraysEqual from "./areArraysEqual.js";
import fetchAllPlatforms from "./fetchAllPlatforms.js";
import fetchCurrentPlatform from "./fetchCurrentPlatform.js";
import specs, { OperatingSystem } from "./specifications.js";

export default async function fetchPowerPlatformCli(options?: Options) {
  if (options?.all && options?.operatingSystem) {
    throw new Error(
      'Conflicting options: cannot specify both "operatingSystem" and "all."'
    );
  }

  const packagePath =
    options?.path ??
    (function getDefaultPath() {
      const thisFilePath = fileURLToPath(import.meta.url);
      const packageDirectory = join(dirname(thisFilePath), "..");
      return join(packageDirectory, "bin");
    })();

  const operatingSystems = options?.all
    ? specs.map((spec) => spec.os)
    : [
        options?.operatingSystem ??
          (() => {
            const plat = platform();
            const spec = specs.find((spec) => spec.platform === platform());
            if (!spec) {
              throw new Error(`Unrecognized operating system: ${plat}`);
            }
            return spec.os;
          })(),
      ];

  const version = options?.version ?? "latest";

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
    options.log?.('"force" detected in options. Fetching pac...');
  } else {
    if (
      areArraysEqual(config.operatingSystems, operatingSystems) &&
      ((config.version &&
        config.version !== "latest" &&
        config.version === options?.version) ||
        (config.expiry && config.expiry > now))
    ) {
      options?.log?.(
        `pac-fetch.json configuration file matches options and have Skipping pac download`
      );
      return;
    }
  }

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
  operatingSystems?: OperatingSystem[];
  version?: string;
};
