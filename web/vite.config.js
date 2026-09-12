import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Inyecta un identificador de build en public/sw.js (copiado tal cual a dist/)
 * para que cada despliegue invalide las cachés del service worker anterior.
 */
export function swBuildId() {
  let outDir = "dist";
  return {
    name: "puente-sw-build-id",
    configResolved(cfg) { outDir = cfg.build.outDir; },
    closeBundle() {
      const file = resolve(outDir, "sw.js");
      if (!existsSync(file)) return;
      const id = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
      writeFileSync(file, readFileSync(file, "utf8").replace(/__BUILD_ID__/g, id));
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // En GitHub Pages la app vive en /<repo>/ ; en desarrollo, en /
  const base = mode === "production" ? (env.VITE_BASE || "/PUENTE/") : "/";
  return {
    base,
    plugins: [react(), swBuildId()],
    build: {
      target: "es2019",
      modulePreload: false,
      cssCodeSplit: false,
      rollupOptions: {
        // Dos entradas: la app de la familia (index.html) y el panel del equipo (equipo.html)
        input: { main: resolve(__dirname, "index.html"), equipo: resolve(__dirname, "equipo.html") },
      },
    },
    server: { port: 5173 },
  };
});
