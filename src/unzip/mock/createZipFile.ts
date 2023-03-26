import { join } from "path";
import { ZipFile } from "yazl";
import type FileSystem from "./FileSystem.js";

export default function createZipFile(contents: FileSystem): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const zipFile = new ZipFile();

    const chunks: any[] = [];
    zipFile.outputStream.on("data", (data) => chunks.push(data));
    zipFile.outputStream.on("error", reject);
    zipFile.outputStream.on("end", () => resolve(Buffer.concat(chunks)));

    zip(contents);

    zipFile.end();

    function zip(contents: FileSystem, basePath: string = "") {
      Object.entries(contents).forEach(([path, value]) => {
        const entryPath = join(basePath, path);
        switch (typeof value) {
          case "string":
            zipFile.addBuffer(Buffer.from(value), entryPath);
            break;
          case "object":
            zip(value, entryPath);
            break;
          default:
            throw new Error(
              `Unexpected zip entry type for ${entryPath}: ${typeof value}`
            );
        }
      });
    }
  });
}
