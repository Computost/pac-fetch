import { chmod, stat } from "fs/promises";
import fetch from "node-fetch";
import { join } from "path";
import { NugetPackageSpecification } from "./specifications.js";
import unzip from "./unzip.js";

export default async function fetchPlatform(
  path: string,
  spec: NugetPackageSpecification,
  version?: string
) {
  const executableName = spec.os === "windows" ? "pac.exe" : "pac";
  if (await pathExists(join(path, executableName))) {
    return;
  }
  const id = spec.id.toLowerCase();
  if (!version) {
    version = await getLatestVersion(id);
  }

  const buffer = await getBuffer(id, version);
  await unzip(buffer, path, {
    include: /^tools\//,
    pathTransformer: (path) => path.replace(/^tools\//, ""),
  });
  await chmod(join(path, executableName), 0x777);
}

async function pathExists(path: string) {
  try {
    await stat(path);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    } else {
      throw error;
    }
  }
}

async function getLatestVersion(id: string): Promise<string> {
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
  const buffer = await response.arrayBuffer();
  return buffer;
}
