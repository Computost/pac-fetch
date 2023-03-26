import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { FetchMockStatic } from "fetch-mock";
import { TextEncoder } from "util";
import downloadVersion from "./downloadVersion";
import mockDownload from "./mock/mockDownload";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock: FetchMockStatic = require("node-fetch");
beforeEach(() => {
  fetchMock.reset();
});

describe("downloadVersion", () => {
  test("Returns the array buffer for the specified version of the package", async () => {
    const id = "My.Package";
    const buffer = new TextEncoder().encode("contents").buffer;
    mockDownload(fetchMock, id, "1", buffer);

    const result = await downloadVersion(id, "1");

    expect(result).toEqual(buffer);
  });
});
