import fetch from "node-fetch";

export default async function downloadVersion(
  id: string,
  version: string
): Promise<ArrayBuffer> {
  const response = await fetch(
    `https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/${id.toLowerCase()}.${version}.nupkg`
  );
  return response.arrayBuffer();
}
