import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { FetchMockStatic } from "fetch-mock";
import getLatestVersion from "./getLatestVersion";
import mockRegistrationPage from "./mock/mockRegistrationPage";

jest.mock("node-fetch", () => require("fetch-mock-jest").sandbox());
const fetchMock: FetchMockStatic = require("node-fetch");
beforeEach(() => {
  fetchMock.reset();
});

describe("getLatest", () =>
  test("Returns the latest version of the package for the ID provide", async () => {
    const id = "My.Package";
    mockRegistrationPage(fetchMock, id, { items: [], upper: "1" });

    const latest = await getLatestVersion(id);

    expect(latest).toBe("1");
  }));
