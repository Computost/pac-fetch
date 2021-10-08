import fetchAllPlatforms from "./fetchAllPlatforms.js";
import fetchCurrentPlatform from "./fetchCurrentPlatform.js";
import getDefaultPath from "./getDefaultPath.js";

export default async function fetchPowerPlatformCli(options?: Options) {
  let path = options?.path;
  let appendOs: boolean;
  if (path === undefined) {
    path = getDefaultPath();
    appendOs = true;
  } else {
    appendOs = false;
  }

  if (options?.all) {
    await fetchAllPlatforms(path);
  } else {
    await fetchCurrentPlatform(path, appendOs);
  }
  return path;
}

interface Options {
  all?: boolean;
  path: string;
}
