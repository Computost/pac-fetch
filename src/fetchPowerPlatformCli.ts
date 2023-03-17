import { createWriteStream } from "fs";
import { chmod, mkdir, readFile, rm, writeFile } from "fs/promises";
import { platform } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Entry, fromBuffer, ZipFile } from "yauzl";
import areArraysEqual from "./areArraysEqual.js";
import Config from "./Config";
import inOneLine from "./inOneLine.js";
import NugetPackageRegistration from "./NugetPackageIndex";
import Options from "./Options";
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
  const optionsMatchConfig =
    areArraysEqual(
      Object.keys(config.operatingSystems ?? {}),
      operatingSystems
    ) && config.version === version;
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
          const response = await fetch(
            `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`
          );
          const packageRegistration =
            (await response.json()) as NugetPackageRegistration;
          if (version === "latest") {
            return packageRegistration.items[0].upper;
          }
          if (
            !packageRegistration.items[0].items.some(
              (catalogPackage) =>
                catalogPackage.catalogEntry.version === version
            )
          ) {
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
        const buffer = await (async function getBuffer() {
          const response = await fetch(
            `https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${osVersion}/${id.toLowerCase()}.${osVersion}.nupkg`
          );
          const buffer = await response.arrayBuffer();
          return buffer;
        })();
        log("Download complete.");

        await rmDirPromise;
        await rmPackageDirPromise;
        log(`Extracting to ${targetDirectory}`);
        await (async function unzip(): Promise<void> {
          await mkdir(targetDirectory, { recursive: true });

          const zipFile = await (function openZipFile(): Promise<ZipFile> {
            return new Promise<ZipFile>((resolve, reject) =>
              fromBuffer(
                Buffer.from(buffer),
                { lazyEntries: true },
                (error?: any, zipFile?: ZipFile) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(zipFile!);
                  }
                }
              )
            );
          })();

          const completionPromise = new Promise((resolve, reject) => {
            zipFile.once("end", resolve);
            zipFile.once("error", reject);
          });
          const callbackPromises: Promise<void>[] = [];

          zipFile.on("entry", (entry: Entry) => {
            callbackPromises.push(
              (async function saveEntry() {
                if (!/^tools\//.test(entry.fileName)) {
                  return;
                }
                const outputPath = entry.fileName.replace(/^tools\//, "");
                const directory = dirname(outputPath);
                await mkdir(join(targetDirectory, directory), {
                  recursive: true,
                });
                await (function saveEntry() {
                  return new Promise((resolve, reject) => {
                    zipFile.openReadStream(entry, (error, stream) => {
                      if (error) {
                        reject(error);
                      } else {
                        stream!.pipe(
                          createWriteStream(join(targetDirectory, outputPath))
                        );
                        stream!.once("end", resolve);
                        stream!.once("error", reject);
                      }
                    });
                  });
                })();
              })()
            );
            zipFile.readEntry();
          });
          zipFile.readEntry();

          await completionPromise;
          await Promise.all(callbackPromises);

          zipFile.close();
        })();
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
