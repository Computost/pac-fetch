import getRegistrationPage from "./getRegistrationPage";

export default async function doesVersionExist(
  id: string,
  version: string
): Promise<boolean> {
  const page = await getRegistrationPage(id);
  return page.items[0].items.some(
    (leaf) => leaf.catalogEntry.version === version
  );
}
