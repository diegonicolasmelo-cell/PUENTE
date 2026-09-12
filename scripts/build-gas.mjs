/**
 * Empaqueta el build de la PWA (web/dist) en apps-script/Index.html para servirlo con HtmlService.
 * HtmlService no puede servir JS/CSS como archivos separados con su tipo MIME, así que se inyectan
 * inline. También regenera Content.gs. Uso: cd web && npm run build:gas
 */
import { readFileSync, writeFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "web/dist");
const indexPath = join(dist, "index.html");
if (!existsSync(indexPath)) {
  console.error("No existe web/dist/index.html. Ejecuta primero `npm run build` en web/.");
  process.exit(1);
}

let html = readFileSync(indexPath, "utf8");
const readAsset = (href) => {
  // href puede venir con base (/PUENTE/assets/x.js) o relativo (./assets/x.js)
  const rel = href.replace(/^https?:\/\/[^/]+/, "").replace(/^\/[^/]+\/assets\//, "assets/").replace(/^\.?\/?assets\//, "assets/").replace(/^\//, "");
  const file = join(dist, rel.startsWith("assets/") ? rel : rel.replace(/^.*?assets\//, "assets/"));
  return readFileSync(file, "utf8");
};

// CSS → <style>
html = html.replace(/<link\s+rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => `<style>\n${readAsset(href)}\n</style>`);
// JS (módulo único) → <script type="module">
html = html.replace(/<script\s+type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, href) => {
  const js = readAsset(href).replace(/<\/script/gi, "<\\/script");
  return `<script type="module">\n${js}\n</script>`;
});
// Enlaces que no aplican dentro del iframe de Apps Script
html = html.replace(/<link\s+rel="(manifest|icon|apple-touch-icon)"[^>]*>\s*/g, "");
html = html.replace(/<link\s+rel="modulepreload"[^>]*>\s*/g, "");
// Marca de modo envoltorio (útil para depurar) 
html = html.replace("<head>", "<head>\n    <!-- Generado por scripts/build-gas.mjs a partir de web/dist. No editar a mano. -->\n    <script>window.PUENTE_HOST = 'apps-script';</script>");

const outPath = resolve(root, "apps-script/Index.html");
writeFileSync(outPath, html);
const kb = Math.round(statSync(outPath).size / 1024);
console.log(`apps-script/Index.html generado (${kb} KB).`);
if (kb > 1500) console.warn("Aviso: el envoltorio supera 1.5 MB; considera revisar el tamaño del bundle.");

execFileSync(process.execPath, [resolve(root, "scripts/build-content-gs.mjs")], { stdio: "inherit" });
