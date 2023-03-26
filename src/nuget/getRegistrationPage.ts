import fetch from "node-fetch";
import type { PackageMetadataResponse } from "./types.js";

export default async function getRegistrationPage(
  id: string
): Promise<PackageMetadataResponse> {
  const response = await fetch(
    `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`
  );
  const result: PackageMetadataResponse = await response.json();
  return result;
}
