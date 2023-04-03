import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "import.meta.vitest": "undefined",
  },
  test: {
    coverage: {
      enabled: true,
      exclude: ["**/mock/*", "**/index.ts", "**/*.test.ts"],
      reporter: ["text", "html"],
    },
    includeSource: ["src/**/*.ts"],
    setupFiles: ["./src/setupTests.ts"],
  },
});
