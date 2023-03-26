import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { FetchMockStatic } from "fetch-mock";
import { TextEncoder } from "util";
import downloadVersion from "./downloadVersion.js";
import mockDownload from "./mock/mockDownload.js";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock: FetchMockStatic = require("node-fetch");
beforeEach(() => {
  fetchMock.reset();
});

describe("downloadVersion", () => {
  test("Returns the array buffer for the specified version of the package", async () => {
    const id = "My.Package";
    const arrayBuffer = new TextEncoder().encode("contents").buffer;
    mockDownload(fetchMock, id, "1", arrayBuffer);

    const result = await downloadVersion(id, "1");

    expect(Buffer.from(new Uint8Array(result))).toEqual(
      Buffer.from(new Uint8Array(arrayBuffer))
    );
  });
});
