export default function withoutWhitespace(
  strings: TemplateStringsArray,
  ...expressions: string[]
) {
  return String.raw(strings, ...expressions).replace(/\s+/g, "");
}
