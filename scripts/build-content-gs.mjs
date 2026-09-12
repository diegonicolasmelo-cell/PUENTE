/**
 * Genera apps-script/Content.gs a partir de web/src/data/defaults.js para que el contenido semilla
 * de la planilla y el contenido por defecto de la app sean exactamente el mismo.
 * Uso: node scripts/build-content-gs.mjs   (también lo ejecuta `npm run build:gas`)
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaults = await import(pathToFileURL(resolve(root, "web/src/data/defaults.js")).href);

const faqRows = [];
for (const [categoria, items] of Object.entries(defaults.FAQ_DATA)) {
  for (const it of items) faqRows.push({ categoria, tag: it.tag || "", q: it.q, a: it.a });
}
const pretty = (v) => JSON.stringify(v, null, 2);

const out = `/**
 * Contenido semilla de Puente UCI. ARCHIVO GENERADO por scripts/build-content-gs.mjs a partir de
 * web/src/data/defaults.js — no editar a mano; edita defaults.js y vuelve a generar.
 * Se copia a la planilla al ejecutar setupSpreadsheet() (solo si la hoja está vacía) y sirve de
 * respaldo si una hoja queda vacía.
 */
var SEED_ETAPAS = ${pretty(defaults.JOURNEY_STEPS)};

var SEED_FAQ = ${pretty(faqRows)};

var SEED_VIDEOS = ${pretty(defaults.VIDEOS)};

var SEED_CONFIG = ${pretty(defaults.CONFIG_DEFAULTS)};

function seedFaqObject_() {
  var out = {};
  SEED_FAQ.forEach(function (f) {
    if (!out[f.categoria]) out[f.categoria] = [];
    var item = { q: f.q, a: f.a };
    if (f.tag) item.tag = f.tag;
    out[f.categoria].push(item);
  });
  return out;
}
`;
writeFileSync(resolve(root, "apps-script/Content.gs"), out);
console.log("apps-script/Content.gs generado:", faqRows.length, "preguntas,", defaults.VIDEOS.length, "videos");
