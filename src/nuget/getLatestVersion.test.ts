import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import getLatestVersion from "./getLatestVersion";
import { mockPackageMetadata } from "./mock";

const id = "My.Package";
const server = setupServer(
  mockPackageMetadata(id, {
    items: [{ items: [], upper: "1" }],
  })
);
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
});

describe("getLatest", () => {
  it("Returns the latest version of the package for the ID provide", async () => {
    const latest = await getLatestVersion(id);

    expect(latest).toBe("1");
  });
});
