import fetchAllPlatforms from "./fetchAllPlatforms.js";
import fetchCurrentPlatform from "./fetchCurrentPlatform.js";
import getDefaultPath from "./getDefaultPath.js";

export default async function fetchPowerPlatformCli(options?: Options) {
  let path = options?.path;
  if (path === undefined) {
    path = getDefaultPath();
  }
  if (options?.all) {
    await fetchAllPlatforms(path);
  } else {
    await fetchCurrentPlatform(path);
  }
  return path;
}

interface Options {
  all?: boolean;
  path?: string;
}
