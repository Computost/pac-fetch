import getPackageMetadata from "./getPackageMetadata";

export default async function getLatestVersion(id: string): Promise<string> {
  return (await getPackageMetadata(id)).items[0].upper;
}
