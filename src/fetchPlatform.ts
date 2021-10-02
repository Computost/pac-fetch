import { chmod } from "fs/promises";
import fetch from "node-fetch";
import { join } from "path";
import NugetPackageSpecification from "./NugetPackageSpecification.js";
import unzip from "./unzip.js";

export default async function fetchPlatform(
  path: string,
  spec: NugetPackageSpecification
) {
  const id = spec.id.toLowerCase();
  const version = await getLatestVersion(id);
  const buffer = await getBuffer(id, version);
  await unzip(buffer, path, {
    include: /^tools\//,
    pathTransformer: (path) => path.replace(/^tools\//, ""),
  });
  const executableName = spec.os === "windows" ? "pac.exe" : "pac";
  await chmod(join(path, executableName), 0x777);
}

async function getLatestVersion(id: string) {
  const response = await fetch(
    `https://api.nuget.org/v3/registration5-semver1/${id}/index.json`
  );
  const contents = (await response.json()) as any;
  return contents.items[0].upper;
}

async function getBuffer(id: string, version: string) {
  const response = await fetch(
    `https://api.nuget.org/v3-flatcontainer/${id}/${version}/${id}.${version}.nupkg`
  );
  const buffer = await response.buffer();
  return buffer;
}
