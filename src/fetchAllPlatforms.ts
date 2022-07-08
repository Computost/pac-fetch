import { join } from "path";
import fetchPlatform from "./fetchPlatform.js";
import packageSpecs from "./specifications.js";

export default async function fetchAllPlatforms(
  path: string,
  version?: string
) {
  await Promise.all(
    packageSpecs.map((spec) =>
      fetchPlatform(join(path, spec.os ?? spec.platform), spec, version)
    )
  );
}
