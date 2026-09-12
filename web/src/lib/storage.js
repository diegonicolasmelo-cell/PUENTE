/** Acceso seguro a localStorage (puede fallar en modo privado o con datos bloqueados). */
export const KEYS = {
  session: "puente.session",
  profile: "puente.profile",
  content: "puente.content",
  pending: "puente.pending",
  apiUrl:  "puente.apiUrl",
};

export function loadJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (_) { return false; }
}

export function removeKey(key) {
  try { localStorage.removeItem(key); } catch (_) { /* ignorar */ }
}

export function getString(key) {
  try { return localStorage.getItem(key) || ""; } catch (_) { return ""; }
}

export function clearAll() {
  Object.values(KEYS).filter((k) => k !== KEYS.apiUrl).forEach(removeKey);
}
