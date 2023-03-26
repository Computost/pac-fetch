import getRegistrationPage from "./getRegistrationPage.js";

export default async function getLatestVersion(id: string): Promise<string> {
  return (await getRegistrationPage(id)).items[0].upper;
}
