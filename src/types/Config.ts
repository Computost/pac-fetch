import { OperatingSystem } from "../specifications";

export default interface Config {
  expiry?: number;
  operatingSystems?: {
    [key in OperatingSystem]?: string;
  };
  version?: string;
}
