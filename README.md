# pac-fetch

A simple tool for .

Currently, the Power Platform product group does not provide an automated way to download and use the [Power Platform CLI (pac)](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) on a machine. This is desirable for any teams that wish to do any custom DevOps tooling. `pac-fetch` provides an easy way download `pac` either through a library or command line.

## Usage

### Commnad line

```
npx pac-fetch --path ./pac
```

### Library

```js
import pacFetch from "pac-fetch";
import { join } from "path";
import { cwd } from "process";

await pacFetch({ path: join(cwd(), "pac") });
```
