import mockFs from "mock-fs";
import { afterEach, beforeEach, vi } from "vitest";
import { setupServer } from "./mock/server";

setupServer();

beforeEach(() => mockFs());

afterEach(() => {
  mockFs.restore();
  vi.restoreAllMocks();
});
