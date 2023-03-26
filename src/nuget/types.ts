export interface PackageMetadataResponse {
  items: RegistrationPage[];
}

export interface RegistrationPage {
  items: RegistrationLeaf[];
  upper: string;
}

export interface RegistrationLeaf {
  catalogEntry: { version: string };
}
