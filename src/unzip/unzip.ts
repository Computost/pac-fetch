import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { cwd } from "process";
import { Entry, fromBuffer, ZipFile } from "yauzl";

export default async function unzip(
  buffer: Buffer,
  targetDirectory?: string,
  subPath?: string
) {
  if (targetDirectory === undefined) {
    targetDirectory = cwd();
  }
  if (subPath) {
    subPath = join(subPath, "/");
  }

  await mkdir(targetDirectory, { recursive: true });

  const zipFile = await (function openZipFile(): Promise<ZipFile> {
    return new Promise<ZipFile>((resolve, reject) =>
      fromBuffer(
        buffer,
        { lazyEntries: true },
        (error?: any, zipFile?: ZipFile) => {
          if (error) {
            reject(error);
          } else {
            resolve(zipFile!);
          }
        }
      )
    );
  })();

  const completionPromise = new Promise((resolve, reject) => {
    zipFile.once("end", resolve);
    zipFile.once("error", reject);
  });
  const callbackPromises: Promise<void>[] = [];

  zipFile.on("entry", (entry: Entry) => {
    callbackPromises.push(
      (async function saveEntry() {
        if (subPath && !entry.fileName.startsWith(subPath)) {
          return;
        }
        const outputPath = subPath
          ? entry.fileName.replace(subPath, "")
          : entry.fileName;
        const directory = dirname(outputPath);
        await mkdir(join(targetDirectory!, directory), {
          recursive: true,
        });
        await (function saveEntry() {
          return new Promise((resolve, reject) => {
            zipFile.openReadStream(entry, (error, stream) => {
              if (error) {
                reject(error);
              } else {
                stream!.pipe(
                  createWriteStream(join(targetDirectory!, outputPath))
                );
                stream!.once("end", resolve);
                stream!.once("error", reject);
              }
            });
          });
        })();
      })()
    );
    zipFile.readEntry();
  });
  zipFile.readEntry();

  await completionPromise;
  await Promise.all(callbackPromises);

  zipFile.close();
}
