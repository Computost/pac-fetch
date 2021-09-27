const { readFile, writeFile } = require("fs/promises");
const { EOL } = require("os");

(async () => {
  const contents = (await readFile("./package.json")).toString();
  const { version } = JSON.parse(contents);
  const script = `export default "${version}";${EOL}`;
  await writeFile("./src/version.ts", script);
})();
