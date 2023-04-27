export default function withoutWhitespace(
  strings: TemplateStringsArray,
  ...expressions: string[]
) {
  return String.raw(strings, ...expressions).replace(/\s+/g, "");
}

/* c8 ignore start */
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe("withoutWhitespace", () =>
    it("removes all whitespace", () =>
      expect(
        withoutWhitespace`
          https://this.is.a.really.long.url/
            and/it/should/be/easily/readable?
              without=needing&
              to=scrollHorizontally`
      ).toEqual(
        "https://this.is.a.really.long.url/and/it/should/be/easily/readable?without=needing&to=scrollHorizontally"
      )));
}
/* c8 ignore stop */
