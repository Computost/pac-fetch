export default interface NugetPackageRegistration {
  items: { items: { catalogEntry: { version: string } }[]; upper: string }[];
}
