import { SetupServer } from "msw/node";

export let server: SetupServer | undefined = undefined;

export function setServer(value: typeof server) {
  server = value;
}
