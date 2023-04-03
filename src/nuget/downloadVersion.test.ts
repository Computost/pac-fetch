import { TextEncoder } from "util";
import { describe, expect, it } from "vitest";
import { mockServer } from "../mock/server";
import downloadVersion from "./downloadVersion";
import { mockDownload } from "./mock";

describe("downloadVersion", () => {
  it("Returns the array buffer for the specified version of the package", async () => {
    const arrayBuffer = new TextEncoder().encode("contents").buffer;
    mockServer(mockDownload("My.Package", "1", arrayBuffer));

    const result = await downloadVersion("My.Package", "1");

    expect(Buffer.from(new Uint8Array(result))).toEqual(
      Buffer.from(new Uint8Array(arrayBuffer))
    );
  });
});
