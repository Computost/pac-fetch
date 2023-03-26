import { FetchMockStatic } from "fetch-mock";
import withoutWhitespace from "../../util/withoutWhitespace.js";

export default function mockDownload(
  fetchMock: FetchMockStatic,
  id: string,
  version: string,
  arrayBuffer: ArrayBuffer
) {
  fetchMock.get(
    withoutWhitespace`
      https://api.nuget.org/v3-flatcontainer/${id.toLowerCase()}/${version}/
        ${id.toLowerCase()}.${version}.nupkg`,
    arrayBuffer,
    { sendAsJson: false }
  );
}
