import fetchAllPlatforms from "./fetchAllPlatforms.js";
import fetchCurrentPlatform from "./fetchCurrentPlatform.js";

export default async function fetchPowerPlatformCli({ all, path }: Options) {
  if (all) {
    await fetchAllPlatforms(path);
  } else {
    await fetchCurrentPlatform(path);
  }
}

interface Options {
  all: boolean;
  path: string;
}
