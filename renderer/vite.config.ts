import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  base: './', // CRITICAL: allows loading assets via file:// protocol
  build: {
    target: 'esnext', // Modern JS for Chromium
    outDir: '../dist/renderer',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "mammoth": "mammoth/mammoth.browser.js"
    },
  },
});
