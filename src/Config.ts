import { OperatingSystem } from "./specifications.js";

export default interface Config {
  expiry?: number;
  operatingSystems?: {
    [key in OperatingSystem]?: string;
  };
  version?: string;
}
