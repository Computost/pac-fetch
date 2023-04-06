import { chmod, readFile, rm, writeFile } from "fs/promises";
import { platform } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Config from "./types/Config";
import inOneLine from "./util/inOneLine";
import Options from "./types/Options";
import specifications, { OperatingSystem } from "./specifications";
import { doesVersionExist, downloadVersion, getLatestVersion } from "./nuget";
import unzip from "./unzip";

export default async function fetchPowerPlatformCli(
  options?: Options
): Promise<string> {
  const operatingSystems = (function getRequestedOperatingSystems() {
    if (options?.all) {
      return specifications.map((spec) => spec.os);
    }

    const spec = specifications.find((spec) => spec.platform === platform())!;
    return [spec.os];
  })();

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
  const optionsMatchConfig = (() => {
    if (config.version !== version || !config.operatingSystems) {
      return false;
    }
    const configOperatingSystems = Object.keys<OperatingSystem>(
      config.operatingSystems
    );
    if (configOperatingSystems.length !== operatingSystems.length) {
      return false;
    }
    return operatingSystems.every((os) => configOperatingSystems.includes(os));
  })();
  if (options?.force) {
    options.log?.('"force" detected in options. Fetching pac.');
  } else if (optionsMatchConfig) {
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
          return packagePath;
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
      return packagePath;
    }
  }

  const rmPackageDirPromise = optionsMatchConfig
    ? Promise.resolve()
    : rm(packagePath, { recursive: true, force: true });
  const rmConfigPromise = rm(configPath, { force: true });

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

        const osVersion = await (async function getOsVersion() {
          if (version === "latest") {
            return getLatestVersion(id);
          }
          if (!(await doesVersionExist(id, version))) {
            throw new Error(`Could not find version ${version} for ${id}`);
          }
          return version;
        })();

        if (
          !options?.force &&
          optionsMatchConfig &&
          osVersion === config.operatingSystems?.[os]
        ) {
          log(`Already have latest version ${osVersion}. Skipping fetch.`);
          return { os, version: osVersion };
        }

        const targetDirectory = multiOs ? join(packagePath, os) : packagePath;
        const rmDirPromise = optionsMatchConfig
          ? rm(targetDirectory, {
              recursive: true,
              force: true,
            })
          : Promise.resolve();

        log(`Downloading ${id} version ${osVersion}.`);
        const buffer = Buffer.from(
          new Uint8Array(await downloadVersion(id, osVersion))
        );
        log("Download complete.");

        await rmDirPromise;
        await rmPackageDirPromise;
        log(`Extracting to ${targetDirectory}`);
        await unzip(buffer, targetDirectory, "tools/");
        log("Extraction complete");

        const executableName = os === "windows" ? "pac.exe" : "pac";
        await chmod(join(targetDirectory, executableName), 0x777);
        log(`Granted execute permissions on ${executableName}.`);
        return { os, version: osVersion };
      })
    )
  ).reduce((current, { os, version }) => ({ ...current, [os]: version }), {});

  await rmConfigPromise;
  await writeFile(
    configPath,
    JSON.stringify({
      ...(version === "latest"
        ? {
            expiry: now + 60 * 60 * 1000,
          }
        : {}),
      operatingSystems: downloadedVersions,
      version,
    } as Config)
  );

  return packagePath;
}
