import { afterEach, describe, expect, test } from "@jest/globals";
import mockFs from "mock-fs";
import createZipFile from "./mock/createZipFile";
import getDirectoryContents from "./mock/getDirectoryContents";
import unzip from "./unzip";

afterEach(() => {
  mockFs.restore();
});

describe("unzip", () => {
  test("Extracts the subpath of the zip file to the target directory", async () => {
    const targetPath = "path/to/target";
    const targetContents = { a: "b", c: "d" };
    const zipFile = await createZipFile({
      ignore: "ignore",
      select: targetContents,
    });
    mockFs();

    await unzip(zipFile, targetPath, "select");

    expect(await getDirectoryContents(targetPath)).toEqual(targetContents);
  });
});
