import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  assetsInclude: ["**/*.xlsx"],
  plugins: [
    TanStackRouterVite(),
    react(),
    svgr({
      svgrOptions: {
        replaceAttrValues: {
          "#1e1e1e": "currentColor",
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: process.env.BASE_URL || "/",
  test: {
    // tests/ are for playwright test
    include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
  },
});
