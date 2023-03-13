import { PathLike } from "fs";
import { stat } from "fs/promises";

export default async function exists(path: PathLike) {
  try {
    await stat(path);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}
