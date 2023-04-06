import mockFs from "mock-fs";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => mockFs());

afterEach(() => {
  mockFs.restore();
  vi.restoreAllMocks();
});
