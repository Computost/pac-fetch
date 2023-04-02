import fetch from "cross-fetch";
import withoutWhitespace from "../util/withoutWhitespace";

export default async function downloadVersion(
  id: string,
  version: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    withoutWhitespace`
      https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/
        ${id.toLowerCase()}.${version}.nupkg`
  );
  return await response.arrayBuffer();
}
