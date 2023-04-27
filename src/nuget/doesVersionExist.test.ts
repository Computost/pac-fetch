import buildPackageEndpoints from "./mock/mock";
import doesVersionExist from "./doesVersionExist";
import { describe, expect, it } from "vitest";
import { usingServer } from "../mock/server";
import { setupServer } from "msw/node";

usingServer(setupServer(...buildPackageEndpoints("My.Package", "1.0.0")));

describe("doesVersionExist", () => {
  it("Returns true if the package contains the requested version", async () => {
    const exists = await doesVersionExist("My.Package", "1.0.0");
    expect(exists).toBe(true);
  });
  it("Returns false if the package does not contain the requested version", async () => {
    const exists = await doesVersionExist("My.Package", "1.0.1");
    expect(exists).toBe(false);
  });
});
