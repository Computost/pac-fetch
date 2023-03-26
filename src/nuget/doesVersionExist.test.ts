import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { FetchMockStatic } from "fetch-mock";
import mockPackageMetadata from "./mock/mockPackageMetadataResponse.js";
import doesVersionExist from "./doesVersionExist.js";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock: FetchMockStatic = require("node-fetch");
beforeEach(() => {
  fetchMock.reset();
});

describe("doesVersionExist", () => {
  test("Returns true if the package contains the requested version", async () => {
    const id = "My.Package";
    mockPackageMetadata(fetchMock, id, {
      items: [{ items: [{ catalogEntry: { version: "1" } }], upper: "1" }],
    });

    const exists = await doesVersionExist(id, "1");

    expect(exists).toBe(true);
  });

  test("Returns false if the package does not contain the requested version", async () => {
    const id = "My.Package";
    mockPackageMetadata(fetchMock, id, {
      items: [{ items: [], upper: "" }],
    });

    const exists = await doesVersionExist(id, "1");

    expect(exists).toBe(false);
  });
});
