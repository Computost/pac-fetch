import { afterAll, afterEach } from "vitest";
import { setServer, server } from "./server";

export default function setupServer() {
  afterEach(() => {
    server?.resetHandlers();
  });
  afterAll(() => {
    server?.close();
    setServer(undefined);
  });
}
