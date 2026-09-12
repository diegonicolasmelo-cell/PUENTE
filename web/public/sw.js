/* Puente UCI — service worker (sin dependencias)
   Estrategias:
   - Navegaciones: red primero, caché de respaldo (abre la app sin señal).
   - Assets con hash (/assets/*): caché primero, son inmutables por nombre.
   - Resto de archivos estáticos: stale-while-revalidate.
   - API (script.google.com / googleusercontent.com): nunca se cachea.
   __BUILD_ID__ lo reemplaza vite.config.js en cada build. */
const VERSION = "puente-__BUILD_ID__";
const SHELL_CACHE = VERSION + "-shell";
const RUNTIME_CACHE = VERSION + "-runtime";
const BASE = new URL("./", self.location).href;
const SHELL = ["", "index.html", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"]
  .map((p) => BASE + p);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("puente-") && !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isApi(url) {
  return /script\.google\.com|googleusercontent\.com|script\.googleapis\.com/.test(url.hostname);
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (isApi(url)) return;                       // la API nunca pasa por caché
  if (url.origin !== self.location.origin) {    // fuentes de Google y otros orígenes
    event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
    return;
  }
  if (req.mode === "navigate") {
    event.respondWith(networkFirst(req));
    return;
  }
  if (url.pathname.includes("/assets/")) {
    event.respondWith(cacheFirst(req, RUNTIME_CACHE));
    return;
  }
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.ok) cache.put(BASE + "index.html", fresh.clone());
    return fresh;
  } catch (_) {
    return (await cache.match(BASE + "index.html")) || (await cache.match(BASE)) || Response.error();
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const fresh = await fetch(req);
  if (fresh && fresh.ok) cache.put(req, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const refresh = fetch(req).then((fresh) => {
    if (fresh && (fresh.ok || fresh.type === "opaque")) cache.put(req, fresh.clone());
    return fresh;
  }).catch(() => null);
  return hit || (await refresh) || Response.error();
}

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
