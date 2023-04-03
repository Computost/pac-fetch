export default function inOneLine(
  strings: TemplateStringsArray,
  ...expressions: string[]
) {
  return String.raw(
    { raw: strings.map((string) => string.replace(/\s*\r?\n\s*/g, " ")) },
    ...expressions
  ).trim();
}

// c8 ignore
if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;
  describe("inOneLine", () => {
    it("trims whitespace", () => expect(inOneLine` abc `).toEqual("abc"));
    it("replaces any linebreaks with a single space", () =>
      expect(
        inOneLine`
          This is a very detailed logging message, but I don't want to force my
            readers to scroll horizontally while reading my code.`
      ).toEqual(
        "This is a very detailed logging message, but I don't want to force my readers to scroll horizontally while reading my code."
      ));
  });
}
