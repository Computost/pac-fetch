import fetch from "cross-fetch";
import { PackageMetadataResponse } from "../types";
import { FetchMock } from "./mockFetch";

export default function mockPackageMetadata(
  id: string,
  packageMetadataResponse: PackageMetadataResponse
) {
  (fetch as FetchMock).mockImplementation((request) =>
    Promise.resolve(
      request ===
        `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`
        ? new Response(JSON.stringify(packageMetadataResponse))
        : new Response(undefined, { status: 404 })
    )
  );
}
