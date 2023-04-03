import { mockPackageMetadata } from "./mock";
import doesVersionExist from "./doesVersionExist";
import { beforeEach, describe, expect, it } from "vitest";
import { mockServer } from "../mock/server";

describe("doesVersionExist", () => {
  const id = "My.Package";
  beforeEach(() => {
    mockServer(
      mockPackageMetadata(id, {
        items: [
          { items: [{ catalogEntry: { version: "1.0.0" } }], upper: "1.0.0" },
        ],
      })
    );
  });

  it("Returns true if the package contains the requested version", async () => {
    const exists = await doesVersionExist(id, "1.0.0");

    expect(exists).toBe(true);
  });

  it("Returns false if the package does not contain the requested version", async () => {
    const exists = await doesVersionExist(id, "1.0.1");

    expect(exists).toBe(false);
  });
});
