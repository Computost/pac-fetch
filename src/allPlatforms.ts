import { join } from "path";
import downloadPlatform from "./downloadPlatform";
import packageSpecs from "./nugetPackages.json";

export default async function downloadAllPlatforms(path: string) {
  await Promise.all(
    packageSpecs.map((spec) =>
      downloadPlatform(join(path, spec.platform), spec)
    )
  );
}
