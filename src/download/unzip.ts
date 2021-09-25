import { createWriteStream } from "fs";
import { mkdir, stat } from "fs/promises";
import { dirname, join } from "path";
import { Entry, fromBuffer, Options, ZipFile } from "yauzl";

export default async function unzip(
  buffer: Buffer,
  destination: string,
  { include, pathTransformer }: UnzipOptions
): Promise<void> {
  try {
    await mkdir(destination);
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      await mkdir(destination, { recursive: true });
    } else {
      throw error;
    }
  }
  const zipFile = await getZipFile(buffer, { lazyEntries: true });
  const entries = getEntries(zipFile);
  const emissions: Promise<void>[] = [];
  for await (const entry of entries) {
    if (!include || include.test(entry.fileName)) {
      emissions.push(
        (async () => {
          const outputPath =
            pathTransformer?.(entry.fileName) ?? entry.fileName;
          const directory = dirname(outputPath);
          if (directory !== ".") {
            try {
              await mkdir(join(destination, directory), { recursive: true });
            } catch (_) {}
          }
          await saveEntry(join(destination, outputPath), entry, zipFile);
        })()
      );
    }
  }
  await Promise.all(emissions);
  zipFile.close();
}

function getZipFile(buffer: Buffer, options?: Options): Promise<ZipFile> {
  return new Promise<ZipFile>((resolve, reject) => {
    if (options) {
      fromBuffer(buffer, options, callback);
    } else {
      fromBuffer(buffer, callback);
    }

    function callback(error?: Error, zipFile?: ZipFile) {
      if (error) {
        reject(error);
      } else {
        resolve(zipFile as ZipFile);
      }
    }
  });
}

async function* getEntries(zipFile: ZipFile): AsyncIterable<Entry> {
  zipFile.readEntry();
  const completionPromise = new Promise((resolve, reject) => {
    zipFile.once("end", resolve);
    zipFile.once("error", reject);
  });
  const data: Entry[] = [];
  let endData: () => void;
  let dataPromise = createDataPromise();

  do {
    while (data.length > 0) {
      yield data.shift()!;
    }
    await Promise.race([completionPromise, dataPromise]);
  } while (data.length > 0);
  endData!();

  function createDataPromise() {
    return new Promise<void>((resolve, reject) => {
      const callback = (entry: Entry) => {
        data.push(entry);
        dataPromise = createDataPromise();
        zipFile.readEntry();
        resolve();
      };
      zipFile.once("entry", callback);
      endData = () => {
        zipFile.off("entry", callback);
        reject();
      };
    });
  }
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

interface UnzipOptions {
  include?: RegExp;
  pathTransformer?: (path: string) => string;
}
