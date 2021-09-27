import fetch from "node-fetch";
import NugetPackageSpecification from "./NugetPackageSpecification.js";
import unzip from "./unzip.js";

export default async function downloadPlatform(
  path: string,
  spec: NugetPackageSpecification
) {
  const id = spec.id.toLowerCase();
  const response = await fetch(
    `https://api.nuget.org/v3-flatcontainer/${id}/${spec.version}/${id}.${spec.version}.nupkg`
  );
  const buffer = await response.buffer();
  await unzip(buffer, path, {
    include: /^tools\//,
    pathTransformer: (path) => path.replace(/^tools\//, ""),
  });
}
