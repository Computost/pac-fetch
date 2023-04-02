import { setupServer } from "msw/node";
import { TextEncoder } from "util";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import downloadVersion from "./downloadVersion";
import { mockDownload } from "./mock";

const id = "My.Package";
const arrayBuffer = new TextEncoder().encode("contents").buffer;
const server = setupServer(mockDownload(id, "1", arrayBuffer));
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  server.resetHandlers();
});

describe("downloadVersion", () => {
  it("Returns the array buffer for the specified version of the package", async () => {
    const result = await downloadVersion(id, "1");

    expect(Buffer.from(new Uint8Array(result))).toEqual(
      Buffer.from(new Uint8Array(arrayBuffer))
    );
  });
});
