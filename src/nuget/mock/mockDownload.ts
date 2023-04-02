import { rest } from "msw";
import withoutWhitespace from "../../util/withoutWhitespace";

export default function mockDownload(
  id: string,
  version: string,
  arrayBuffer: ArrayBuffer
) {
  return rest.get(
    withoutWhitespace`
      https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/
        ${id.toLowerCase()}.${version}.nupkg`,
    (_, respond, context) => respond(context.body(arrayBuffer))
  );
}
