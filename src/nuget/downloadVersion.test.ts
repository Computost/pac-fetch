import { TextEncoder } from "util";
import { afterEach, describe, expect, it, vi } from "vitest";
import downloadVersion from "./downloadVersion.js";
import mockDownload from "./mock/mockDownload.js";

vi.mock("cross-fetch", async () => ({
  ...(await vi.importActual<typeof import("cross-fetch")>("cross-fetch")),
  default: vi.fn(),
}));

describe("downloadVersion", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("Returns the array buffer for the specified version of the package", async () => {
    const id = "My.Package";
    const arrayBuffer = new TextEncoder().encode("contents").buffer;
    mockDownload(id, "1", arrayBuffer);

    const result = await downloadVersion(id, "1");

    expect(result.byteLength).toEqual(arrayBuffer.byteLength);
    expect(Buffer.from(new Uint8Array(result))).toEqual(
      Buffer.from(new Uint8Array(arrayBuffer))
    );
  });
});
