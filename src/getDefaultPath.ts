import { join } from "path";
import { cwd } from "process";

export default function getDefaultPath() {
  return join(cwd(), "bin", "pac");
}
