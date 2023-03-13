const specs: NugetPackageSpecification[] = [
  {
    id: "Microsoft.PowerApps.CLI",
    platform: "win32",
    os: "windows",
  },
  {
    id: "Microsoft.PowerApps.CLI.Core.osx-x64",
    platform: "darwin",
    os: "osx",
  },
  {
    id: "Microsoft.PowerApps.CLI.Core.linux-x64",
    platform: "linux",
    os: "linux",
  },
];
export default specs;

export interface NugetPackageSpecification {
  id: string;
  platform: string;
  os: OperatingSystem;
}

export type OperatingSystem = "windows" | "osx" | "linux";
