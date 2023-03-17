#!/usr/bin/env node
import { program } from "commander";
import fetchPowerPlatformCli from "./index.js";
import { version } from "./version.js";

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
    "version of the Power Platform CLI to download"
  )
  .option(
    "-f, --force",
    "force pac-fetch to download pac regardless of the current path state"
  )
  .action(async ({ pacVersion: version, ...options }) => {
    await fetchPowerPlatformCli({
      log: console.log,
      ...options,
      ...(version ? { version } : {}),
    });
  })
  .parse();
