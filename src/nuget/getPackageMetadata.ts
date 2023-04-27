import fetch from "cross-fetch";
import type { PackageMetadataResponse } from "./types";

export default async function getPackageMetadata(
  id: string
): Promise<PackageMetadataResponse> {
  const response = await fetch(
    `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`
  );
  const result: PackageMetadataResponse =
    (await response.json()) as PackageMetadataResponse;
  return result;
}
