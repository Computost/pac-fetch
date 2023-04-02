import { OperatingSystem } from "../specifications";

export default interface Options {
  all?: boolean;
  operatingSystem?: OperatingSystem;
  path?: string;
  version?: string;
  force?: boolean;
  log?: (...data: any[]) => void;
}
