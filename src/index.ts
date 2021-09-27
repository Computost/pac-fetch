#!/usr/bin/env node
import { Command } from "commander";
import { join } from "path";
import { cwd } from "process";
import downloadAllPlatforms from "./allPlatforms.js";
import downloadCurrentPlatform from "./currentPlatform.js";
import version from "./version.js";

const options: Options = new Command()
  .version(version)
  .option(
    "-a, --all",
    "download Power Platform CLI for all supported platforms " +
      "(otherwise, will download for the current platform)"
  )
  .option(
    "-p, --path <path>",
    "destination path to download the Power Platform CLI",
    join(cwd(), "bin")
  )
  .parse()
  .opts();
(async () => {
  if (options.all) {
    await downloadAllPlatforms(options.path);
  } else {
    await downloadCurrentPlatform(options.path);
  }
})().catch(console.error);

interface Options {
  all: boolean;
  path: string;
}
