import fetch from "node-fetch";
import { RegistrationPage } from "./types";

export default async function getRegistrationPage(
  id: string
): Promise<RegistrationPage> {
  const response = await fetch(
    `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`
  );
  const result: RegistrationPage = await response.json();
  return result;
}
