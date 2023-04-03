import { ZipFile } from "yazl";

export default interface FileSystem {
  [path: string]:
    | ((zipFile: ZipFile, entryPath: string) => void)
    | string
    | FileSystem;
}
