import { platform } from "os";
import { join } from "path";
import fetchPlatform from "./fetchPlatform.js";
import packageSpecs from "./specifications.js";

export default async function fetchCurrentPlatform(
  path: string,
  appendOs: boolean
) {
  const spec = packageSpecs.find((s) => s.platform === platform());
  if (!spec) {
    throw `Platform ${platform()} is not supported.`;
  }
  await fetchPlatform(appendOs ? join(path, spec.os) : path, spec);
}
