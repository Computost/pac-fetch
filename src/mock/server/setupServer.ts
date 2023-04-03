import { afterEach } from "vitest";
import { setServer, server } from "./server";

export default function setupServer() {
  afterEach(() => {
    server?.close();
    setServer(undefined);
  });
}
