/**
 * Genera los PNG del icono a partir de web/public/icons/icon.svg:
 *   icon-192.png, icon-512.png            → manifest (esquinas transparentes, el sistema aplica su máscara)
 *   icon-maskable-512.png                 → Android "maskable": arte al 80% sobre fondo sólido
 *   apple-touch-icon.png (180×180)        → iPhone/iPad: opaco y sin esquinas transparentes (iOS las pintaría de negro)
 * Requiere Playwright (Chromium): cd web && npm i -D playwright && npx playwright install chromium
 * Uso: node scripts/build-icons.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(resolve(root, "web/package.json"));
let chromium;
try { ({ chromium } = require("playwright")); }
catch (e) { console.error("Falta Playwright: cd web && npm i -D playwright && npx playwright install chromium"); process.exit(1); }

const BRAND_BG = "#03045E";
const svg = readFileSync(resolve(root, "web/public/icons/icon.svg"), "utf8");
const out = resolve(root, "web/public/icons") + "/";
// Si Playwright no encuentra su Chromium, se puede indicar uno con CHROMIUM_PATH (p. ej. /usr/bin/chromium)
const browser = await chromium.launch().catch((e) => {
  const executablePath = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  return chromium.launch({ executablePath }).catch(() => { throw e; });
});
const page = await browser.newPage();

async function render({ name, size, inner = size, background = "transparent", transparent = true }) {
  const pad = Math.round((size - inner) / 2);
  const art = svg.replace(/width="512" height="512"/, `width="${inner}" height="${inner}"`);
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px;background:${background}"><div style="margin:${pad}px;width:${inner}px;height:${inner}px">${art}</div></body>`);
  await page.screenshot({ path: out + name, omitBackground: transparent, clip: { x: 0, y: 0, width: size, height: size } });
  console.log("ok", name);
}
await render({ name: "icon-192.png", size: 192 });
await render({ name: "icon-512.png", size: 512 });
await render({ name: "icon-maskable-512.png", size: 512, inner: Math.round(512 * 0.8), background: BRAND_BG, transparent: false });
await render({ name: "apple-touch-icon.png", size: 180, background: BRAND_BG, transparent: false });
await browser.close();
