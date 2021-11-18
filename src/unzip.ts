import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { Entry, fromBuffer, ZipFile } from "yauzl";

export default async function unzip(
  buffer: ArrayBuffer,
  destination: string,
  { include, pathTransformer }: UnzipOptions
): Promise<void> {
  await createDirectory(destination);
  const zipFile = await openZipFile(buffer);
  await forEachEntryIn(zipFile, async (entry) => {
    if (include?.test(entry.fileName)) {
      const outputPath = pathTransformer?.(entry.fileName) ?? entry.fileName;
      const directory = dirname(outputPath);
      if (directory !== ".") {
        try {
          await mkdir(join(destination, directory), { recursive: true });
        } catch (_) {}
      }
      await saveEntry(join(destination, outputPath), entry, zipFile);
    }
  });
}

interface UnzipOptions {
  include?: RegExp;
  pathTransformer?: (path: string) => string;
}

async function createDirectory(path: string) {
  try {
    await mkdir(path);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      await mkdir(path, { recursive: true });
    } else {
      throw error;
    }
  }
}

function openZipFile(buffer: ArrayBuffer): Promise<ZipFile> {
  return new Promise<ZipFile>((resolve, reject) =>
    fromBuffer(
      Buffer.from(buffer),
      { lazyEntries: true },
      (error?: Error, zipFile?: ZipFile) => {
        if (error) {
          reject(error);
        } else {
          resolve(zipFile!);
        }
      }
    )
  );
}

async function forEachEntryIn(
  zipFile: ZipFile,
  callback: (entry: Entry) => Promise<void>
) {
  const completionPromise = createCompletionPromise(zipFile);
  const callbackPromises: Promise<void>[] = [];

  zipFile.on("entry", (entry: Entry) => {
    callbackPromises.push(callback(entry));
    zipFile.readEntry();
  });

  zipFile.readEntry();

  await completionPromise;
  await Promise.all(callbackPromises);

  zipFile.close();
}

function createCompletionPromise(zipFile: ZipFile) {
  return new Promise((resolve, reject) => {
    zipFile.once("end", resolve);
    zipFile.once("error", reject);
  });
}

function saveEntry(destination: string, entry: Entry, zipFile: ZipFile) {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error) {
        reject(error);
      } else {
        stream!.pipe(createWriteStream(destination));
        stream!.once("end", resolve);
        stream!.once("error", reject);
      }
    });
  });
}
