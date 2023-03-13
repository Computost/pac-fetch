import { readFile } from "fs/promises";
import { version } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import exists from "./exists.js";
import fetchAllPlatforms from "./fetchAllPlatforms.js";
import fetchCurrentPlatform from "./fetchCurrentPlatform.js";

export default async function fetchPowerPlatformCli(options?: {
  all?: boolean;
  path?: string;
  version?: string;
  update?: boolean;
  log?: (...data: any[]) => void;
}) {
  const packagePath =
    options?.path ??
    (function getDefaultPath() {
      const thisFilePath = fileURLToPath(import.meta.url);
      const packageDirectory = join(dirname(thisFilePath), "..");
      return join(packageDirectory, "bin");
    })();

  const context = await (async function getContext(): Promise<Context> {
    const path = join(packagePath, "pac-fetch.json");
    try {
      return JSON.parse((await readFile(path)).toString());
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return {};
      }
      throw error;
    }
  })();
  if (
    (function skipFetch() {
      if (options?.update) {
        return false;
      }
    })()
  ) {
    return;
  }

  const configPath = join(packagePath, "pac-fetch.json");
  const config = await (async function getConfig(): Promise<Partial<Context>> {
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
  if (
    (function expired() {
      return "expiry" in config && config.expiry && config.expiry < now;
    })() ||
    (function differentVersion() {
      return (
        options?.version &&
        "version" in config &&
        config.version &&
        config.version !== options.version
      );
    })()
  ) {
  }
  if (options?.all) {
    await fetchAllPlatforms(packagePath, options.version);
  } else {
    await fetchCurrentPlatform(packagePath, appendOs, options?.version);
  }
  return packagePath;
}

type Options = {
  all?: boolean;
  path?: string;
  version?: string;
  update?: boolean;
};

type Context = { expiry?: number; version?: string };
