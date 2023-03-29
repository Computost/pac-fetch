import fetch from "cross-fetch";
import { Mock, vi } from "vitest";

export default function mockFetch() {
  vi.mock("cross-fetch", () => ({
    default: vi.fn(),
  }));
}

export type FetchMock = Mock<
  Parameters<typeof fetch>,
  ReturnType<typeof fetch>
>;
