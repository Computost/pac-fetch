import { TextEncoder } from "util";
import { beforeAll, describe, expect, it } from "vitest";
import { mockServer } from "../mock/server";
import downloadVersion from "./downloadVersion";
import { mockDownload } from "./mock";

const arrayBuffer = new TextEncoder().encode("contents").buffer;
beforeAll(() => mockServer(mockDownload("My.Package", "1", arrayBuffer)));

describe("downloadVersion", () => {
  it("Returns the array buffer for the specified version of the package", async () => {
    const result = await downloadVersion("My.Package", "1");
    expect(Buffer.from(new Uint8Array(result))).toEqual(
      Buffer.from(new Uint8Array(arrayBuffer))
    );
  });
});
