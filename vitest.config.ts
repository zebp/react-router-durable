import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        main: "./tests/worker.ts",
        miniflare: {
          compatibilityDate: "2024-01-24",
          compatibilityFlags: ["nodejs_compat", "rpc"],
          durableObjects: {
            test: {
              className: "TestDurableObject",
              useSQLite: true,
            },
          },
        },
      },
    },
  },
});
