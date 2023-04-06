import { rest } from "msw";
import { setupServer } from "msw/node";
import withoutWhitespace from "./util/withoutWhitespace";

const metadataUrl = (packageId: string) =>
  `https://api.nuget.org/v3/registration5-semver1/${packageId.toLowerCase()}/index.json`;

const makePackageMetadata = (version: string) => ({
  items: [{ items: [{ catalogEntry: { version } }], upper: version }],
});

const downloadUrl = (packageId: string, version: string) =>
  `https://api.nuget.org/v3-flatcontainer/${packageId.toLowerCase()}/${version}/${packageId.toLowerCase()}.${version}.nupkg`;

const makePackageEndpoints = (packageId: string, version: string) => [
  rest.get(metadataUrl(packageId), (_, respond, context) =>
    respond(context.json(makePackageMetadata(version)))
  ),
  rest.get(downloadUrl(packageId, version), (_, respond, context) =>
    respond(context.body("nupkg zip contents here"))
  ),
];

const server = setupServer(
  ...makePackageEndpoints("Microsoft.PowerApps.CLI.Core.linux-x64", "1.0.0"),
  ...makePackageEndpoints("Microsoft.PowerApps.CLI.Core.osx-x64", "1.0.0"),
  ...makePackageEndpoints("Microsoft.PowerApps.CLI", "1.0.0")
);
