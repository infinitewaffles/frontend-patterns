import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  server: {
    port: 8081,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    watch: false,

    // These aliases should be temporary
    // https://github.com/vitest-dev/vitest/issues/1652#issuecomment-1195323396
    // https://github.com/withastro/astro/issues/3449#issuecomment-1241167878
    alias: [
      {
        find: "preact/hooks",
        replacement: require.resolve("preact/hooks"),
      },
      {
        find: "@testing-library/preact",
        replacement: require.resolve("@testing-library/preact"),
      },
    ],
  },
});
