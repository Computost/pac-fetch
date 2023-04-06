import { SetupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

export default function usingServer(server: SetupServer) {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
  });
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => {
    server.close();
  });
}
