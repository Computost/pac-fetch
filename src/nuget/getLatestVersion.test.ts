import { afterEach, describe, expect, it, vi } from "vitest";
import getLatestVersion from "./getLatestVersion";
import mockPackageMetadata from "./mock/mockPackageMetadataResponse";

vi.mock("cross-fetch", () => ({ default: vi.fn() }));

describe("getLatest", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("Returns the latest version of the package for the ID provide", async () => {
    const id = "My.Package";
    mockPackageMetadata(id, {
      items: [{ items: [], upper: "1" }],
    });

    const latest = await getLatestVersion(id);

    expect(latest).toBe("1");
  });
});
