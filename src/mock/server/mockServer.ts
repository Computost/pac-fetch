import { setupServer } from "msw/node";
import { server, setServer } from "./server";

export default function mockServer(
  ...handlers: Parameters<typeof setupServer>
) {
  setServer(setupServer(...handlers));
  server?.listen({ onUnhandledRequest: "error" });
}
