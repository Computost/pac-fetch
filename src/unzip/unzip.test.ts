import { cwd } from "process";
import { describe, expect, it, Mock, vi } from "vitest";
import createZipFile from "./mock/createZipFile";
import getDirectoryContents from "./mock/getDirectoryContents";
import unzip from "./unzip";

vi.mock("process");

describe("unzip", () => {
  it("defaults to the current working directory", async () => {
    const currentDirectory = "/path/to/target";
    const contents = { a: "b" };
    const zipFile = await createZipFile(contents);
    (cwd as Mock).mockReturnValue(currentDirectory);

    await unzip(zipFile);

    expect(await getDirectoryContents(currentDirectory)).toEqual(contents);
  });

  it("extracts the sub-path of the zip file to the target directory", async () => {
    const targetPath = "/path/to/target";
    const targetContents = { a: "b", c: "d" };
    const zipFile = await createZipFile({
      ignore: "ignore",
      select: targetContents,
    });

    await unzip(zipFile, targetPath, "select");

    expect(await getDirectoryContents(targetPath)).toEqual(targetContents);
  });

  it("rejects when given an invalid zip file", async () =>
    await expect(unzip(Buffer.from("invalid zip"))).rejects.toThrow(
      "end of central directory record signature not found"
    ));

  it("rejects when it can't read an entry in a zip file", async () => {
    const corruptZipFile = Buffer.from([
      ...Array.from({ length: 34 }, () => 0),
      ...(
        await createZipFile({
          a: "b",
        })
      ).subarray(34),
    ]);

    await expect(unzip(corruptZipFile, "/path/to/target")).rejects.toThrowError(
      "invalid local file header signature: 0x0"
    );
  });
});
