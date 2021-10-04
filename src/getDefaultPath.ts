import { dirname, join } from "path";
import { fileURLToPath } from "url";

export default function getDefaultPath() {
  return join(getDirName(), "..", "bin");
}

function getDirName() {
  const fileName = fileURLToPath(import.meta.url);
  const dirName = dirname(fileName);
  return dirName;
}
