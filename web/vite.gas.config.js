// Build de una sola entrada (app de la familia) para inyectarla en apps-script/Index.html.
// El panel del equipo no va en el envoltorio: se usa desde GitHub Pages.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    target: "es2019",
    outDir: "dist-gas",
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: { input: resolve(__dirname, "index.html"), output: { manualChunks: undefined } },
  },
});
