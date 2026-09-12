/**
 * Cliente de la API de Puente UCI. Un solo contrato, tres modos:
 *   gas    → la app corre dentro del envoltorio de Apps Script: google.script.run.api(req)
 *   remote → la app corre como PWA (GitHub Pages): fetch POST text/plain a la URL /exec
 *   local  → sin backend configurado: todo queda en el dispositivo
 * Todas las respuestas del servidor tienen forma { ok, data } | { ok:false, error }.
 */
import { KEYS, getString } from "./storage.js";

const TIMEOUT_MS = 25000;

export function getApiUrl() {
  return (
    (typeof window !== "undefined" && window.PUENTE_CONFIG && window.PUENTE_CONFIG.apiUrl) ||
    getString(KEYS.apiUrl) ||
    import.meta.env.VITE_API_URL ||
    ""
  ).trim();
}

export function isGasHost() {
  return typeof window !== "undefined" && !!(window.google && window.google.script && window.google.script.run);
}

export function getMode() {
  if (isGasHost()) return "gas";
  if (getApiUrl()) return "remote";
  return "local";
}

export function hasBackend() {
  return getMode() !== "local";
}

export class ApiError extends Error {
  constructor(message, code = "error") { super(message); this.code = code; }
}

function withTimeout(promise, ms) {
  let t;
  const timeout = new Promise((_, reject) => { t = setTimeout(() => reject(new ApiError("Tiempo de espera agotado", "timeout")), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

function unwrap(res) {
  if (!res || typeof res !== "object") throw new ApiError("Respuesta inválida del servidor", "bad_response");
  if (!res.ok) throw new ApiError(res.error || "Error del servidor", res.code || "server");
  return res.data;
}

function callGas(req) {
  return new Promise((resolve, reject) => {
    window.google.script.run
      .withSuccessHandler((res) => { try { resolve(unwrap(typeof res === "string" ? JSON.parse(res) : res)); } catch (e) { reject(e); } })
      .withFailureHandler((err) => reject(new ApiError(err && err.message ? err.message : String(err), "gas")))
      .api(req);
  });
}

async function callRemote(req) {
  const url = getApiUrl();
  if (!url) throw new ApiError("Sin backend configurado", "no_backend");
  let response;
  try {
    // text/plain evita el preflight CORS (Apps Script no responde OPTIONS); redirect:follow es necesario
    // porque /exec redirige a googleusercontent.com.
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(req),
      redirect: "follow",
    });
  } catch (e) {
    throw new ApiError("Sin conexión con el servidor", "network");
  }
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); }
  catch (_) {
    if (/accounts\.google\.com|Sign in/i.test(text)) throw new ApiError("La implementación de Apps Script no está publicada para 'Cualquier persona'", "auth");
    throw new ApiError("Respuesta no válida del servidor", "bad_response");
  }
  return unwrap(json);
}

/**
 * callApi("getProfile", { code }) → Promise<data>
 * Lanza ApiError con .code: no_backend | network | timeout | auth | not_found | server | ...
 */
export function callApi(action, payload = {}) {
  const req = { action, ...payload, client: "pwa", v: 1 };
  const mode = getMode();
  if (mode === "local") return Promise.reject(new ApiError("Sin backend configurado", "no_backend"));
  return withTimeout(mode === "gas" ? callGas(req) : callRemote(req), TIMEOUT_MS);
}
