export default function inOneLine(
  strings: TemplateStringsArray,
  ...expressions: string[]
) {
  return String.raw(
    { raw: strings.map((string) => string.replace(/\s*\r?\n\s*/g, " ")) },
    ...expressions
  ).trim();
}
