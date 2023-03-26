import { FetchMockStatic } from "fetch-mock";
import { PackageMetadataResponse } from "../types.js";

export default function mockPackageMetadataResponse(
  fetchMock: FetchMockStatic,
  id: string,
  packageMetadataResponse: PackageMetadataResponse
) {
  fetchMock.get(
    `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`,
    packageMetadataResponse
  );
}
