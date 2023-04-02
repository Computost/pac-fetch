import { mockPackageMetadata } from "./mock";
import doesVersionExist from "./doesVersionExist";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { setupServer } from "msw/node";

const id = "My.Package";
const server = setupServer(
  mockPackageMetadata(id, {
    items: [{ items: [{ catalogEntry: { version: "1" } }], upper: "1" }],
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

describe("doesVersionExist", () => {
  it("Returns true if the package contains the requested version", async () => {
    const exists = await doesVersionExist(id, "1");

    expect(exists).toBe(true);
  });

  it("Returns false if the package does not contain the requested version", async () => {
    const exists = await doesVersionExist(id, "2");

    expect(exists).toBe(false);
  });
});
