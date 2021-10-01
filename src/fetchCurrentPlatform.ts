import { platform } from "os";
import fetchPlatform from "./downloadPlatform.js";
import packageSpecs from "./specifications.js";

export default async function fetchCurrentPlatform(path: string) {
  const spec = packageSpecs.find((s) => s.platform === platform());
  if (!spec) {
    throw `Platform ${platform()} is not supported.`;
  }
  await fetchPlatform(path, spec);
}
