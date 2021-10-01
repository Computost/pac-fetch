#!/usr/bin/env node
import { program } from "commander";
import { join } from "path";
import { cwd } from "process";
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
    "destination path to download the Power Platform CLI",
    join(cwd(), "bin")
  )
  .action(fetchPowerPlatformCli)
  .parse();
