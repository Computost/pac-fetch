export default interface FileSystem {
  [path: string]: string | FileSystem;
}
