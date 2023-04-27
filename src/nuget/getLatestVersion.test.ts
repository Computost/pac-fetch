import { setupServer } from "msw/node";
import { describe, expect, it } from "vitest";
import { usingServer } from "../mock/server";
import getLatestVersion from "./getLatestVersion";
import buildPackageEndpoints from "./mock/mock";

usingServer(setupServer(...buildPackageEndpoints("My.Package", "1.0.0")));

describe("getLatest", () => {
  it("Returns the latest version of the package for the ID provide", async () => {
    const latest = await getLatestVersion("My.Package");
    expect(latest).toBe("1.0.0");
  });
});
