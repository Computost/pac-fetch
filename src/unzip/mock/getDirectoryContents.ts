import { readdir, readFile } from "fs/promises";
import { join } from "path";
import FileSystem from "./FileSystem";

export default async function getDirectoryContents(
  path: string
): Promise<FileSystem> {
  const result: FileSystem = {};
  await Promise.all(
    (
      await readdir(path, { withFileTypes: true })
    ).map(async (entry) => {
      const entryPath = join(path, entry.name);
      result[entry.name] = entry.isDirectory()
        ? await getDirectoryContents(entryPath)
        : (await readFile(entryPath)).toString();
    })
  );
  return result;
}
