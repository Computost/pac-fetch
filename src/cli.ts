#!/usr/bin/env node
import { program } from "commander";
import getDefaultPath from "./getDefaultPath.js";
import fetchPowerPlatformCli from "./index.js";
import version from "./version.js";

program
  .version(version)
  .option(
    "-a, --all",
    "download Power Platform CLI for all supported platforms " +
      "(otherwise, will download for the current platform)"
  )
  .option(
    "-p, --path <path>",
    "destination path to download the Power Platform CLI"
  )
  .option(
    "-v, --pac-version <version>",
    "version of the Power Platform CLI"
  )
  .action(async (options) => {
    await fetchPowerPlatformCli(options);
  })
  .parse();
