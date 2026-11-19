/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // import.meta.dirname, bukan __dirname: Vite 8 memperingatkan __dirname di config.
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: true,
  },
  test: { environment: "jsdom", setupFiles: ["./src/test/setup.ts"] },
});
