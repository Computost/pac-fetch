import { OperatingSystem } from "./specifications.js";

export default interface Options {
  all?: boolean;
  operatingSystem?: OperatingSystem;
  path?: string;
  version?: string;
  force?: boolean;
  log?: (...data: any[]) => void;
}
