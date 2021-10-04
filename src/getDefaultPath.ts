import { join } from "path";

export default function getDefaultPath() {
  return join(__dirname, "..", "bin", "pac");
}
