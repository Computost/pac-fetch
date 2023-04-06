export default interface Options {
  all?: boolean;
  path?: string;
  version?: string;
  force?: boolean;
  log?: (...data: any[]) => void;
}
