import { setupServer } from "msw/node";
import { TextEncoder } from "util";
import { describe, expect, it } from "vitest";
import { usingServer } from "../mock/server";
import downloadVersion from "./downloadVersion";
import buildPackageEndpoints from "./mock/mock";

usingServer(
  setupServer(
    ...buildPackageEndpoints(
      "My.Package",
      "1.0.0",
      new TextEncoder().encode(".nupkg contents").buffer
    )
  )
);

describe("downloadVersion", () => {
  it("Returns the array buffer for the specified version of the package", async () => {
    const result = await downloadVersion("My.Package", "1.0.0");
    expect(new TextDecoder().decode(result)).toEqual(".nupkg contents");
  });
});
