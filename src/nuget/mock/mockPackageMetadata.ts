import { rest } from "msw";
import { PackageMetadataResponse } from "../types";

export default function mockPackageMetadata(
  id: string,
  packageMetadataResponse: PackageMetadataResponse
) {
  return rest.get(
    `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`,
    (_, respond, context) => respond(context.json(packageMetadataResponse))
  );
}
