import { describe, expect, it } from "vitest";
import { mockServer } from "../mock/server";
import getLatestVersion from "./getLatestVersion";
import { mockPackageMetadata } from "./mock";

describe("getLatest", () => {
  it("Returns the latest version of the package for the ID provide", async () => {
    const id = "My.Package";
    mockServer(
      mockPackageMetadata(id, {
        items: [{ items: [], upper: "1.0.0" }],
      })
    );

    const latest = await getLatestVersion(id);

    expect(latest).toBe("1.0.0");
  });
});
