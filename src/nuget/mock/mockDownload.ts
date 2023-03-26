import { FetchMockStatic } from "fetch-mock";

export default function mockDownload(
  fetchMock: FetchMockStatic,
  id: string,
  version: string,
  arrayBuffer: ArrayBuffer
) {
  fetchMock.get(
    `https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/${id.toLowerCase()}.${version}.nupkg`,
    arrayBuffer
  );
}
