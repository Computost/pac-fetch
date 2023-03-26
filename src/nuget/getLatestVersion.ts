import getRegistrationPage from "./getRegistrationPage";

export default async function getLatestVersion(id: string): Promise<string> {
  return (await getRegistrationPage(id)).upper;
}
