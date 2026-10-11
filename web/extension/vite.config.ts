import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const extensionDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  configFile: false,
  root: path.resolve(extensionDirectory, ".."),
  plugins: [react()],
  publicDir: path.join(extensionDirectory, "public"),
  build: {
    outDir: path.resolve(extensionDirectory, "../extension-dist"),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.join(extensionDirectory, "content.tsx"),
      output: {
        format: "iife",
        entryFileNames: "content.js",
        inlineDynamicImports: true,
      },
    },
  },
});
