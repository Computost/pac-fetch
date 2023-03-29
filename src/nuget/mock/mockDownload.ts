import fetch, { Response } from "cross-fetch";
import withoutWhitespace from "../../util/withoutWhitespace";
import { FetchMock } from "./mockFetch";

export default function mockDownload(
  id: string,
  version: string,
  arrayBuffer: ArrayBuffer
) {
  (fetch as FetchMock).mockImplementation((request) =>
    Promise.resolve(
      request ===
        withoutWhitespace`
  https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/
    ${id.toLowerCase()}.${version}.nupkg`
        ? new Response(arrayBuffer)
        : new Response(undefined, { status: 404 })
    )
  );
}
