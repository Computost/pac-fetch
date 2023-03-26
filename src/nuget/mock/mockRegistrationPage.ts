import { FetchMockStatic } from "fetch-mock";
import { RegistrationPage } from "../types";

export default function mockRegistrationPage(
  fetchMock: FetchMockStatic,
  id: string,
  registrationPage: RegistrationPage
) {
  fetchMock.get(
    `https://api.nuget.org/v3/registration5-semver1/${id.toLowerCase()}/index.json`,
    registrationPage
  );
}
