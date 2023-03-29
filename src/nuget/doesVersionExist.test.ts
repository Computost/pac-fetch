import mockPackageMetadata from "./mock/mockPackageMetadataResponse";
import doesVersionExist from "./doesVersionExist";
import { describe, expect, it, vi } from "vitest";

vi.mock("cross-fetch", () => ({ default: vi.fn() }));

describe("doesVersionExist", () => {
  it("Returns true if the package contains the requested version", async () => {
    const id = "My.Package";
    mockPackageMetadata(id, {
      items: [{ items: [{ catalogEntry: { version: "1" } }], upper: "1" }],
    });

    const exists = await doesVersionExist(id, "1");

    expect(exists).toBe(true);
  });

  it("Returns false if the package does not contain the requested version", async () => {
    const id = "My.Package";
    mockPackageMetadata(id, {
      items: [{ items: [], upper: "" }],
    });

    const exists = await doesVersionExist(id, "1");

    expect(exists).toBe(false);
  });
});
