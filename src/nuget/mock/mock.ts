import { DefaultBodyType, MockedRequest, rest, RestHandler } from "msw";
import withoutWhitespace from "../../util/withoutWhitespace";
import { PackageMetadataResponse } from "../types";

export default function buildPackageEndpoints(
  id: string,
  version: string,
  contents?: ArrayBuffer
) {
  const endpoints: RestHandler<MockedRequest<DefaultBodyType>>[] = [];

  (function addMetadata() {
    const metadataUrl = withoutWhitespace`
      https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`;
    const metadata: PackageMetadataResponse = {
      items: [{ items: [{ catalogEntry: { version } }], upper: version }],
    };
    endpoints.push(
      rest.get(metadataUrl, (_, respond, context) =>
        respond(context.json(metadata))
      )
    );
  })();

  (function addPackage() {
    if (!contents) {
      return;
    }
    const downloadUrl = withoutWhitespace`
      https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/
        ${id.toLowerCase()}.${version}.nupkg`;
    endpoints.push(
      rest.get(downloadUrl, (_, respond, context) =>
        respond(context.body(contents))
      )
    );
  })();

  return endpoints;
}
