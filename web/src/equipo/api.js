/** Cliente del panel: agrega el token de la sesión del profesional a cada acción. */
import { callApi, ApiError } from "../lib/api.js";
import { loadJSON, saveJSON, removeKey } from "../lib/storage.js";

export const STAFF_KEY = "puente.staff";

export function getStaffSession() { return loadJSON(STAFF_KEY, null); }
export function setStaffSession(s) { saveJSON(STAFF_KEY, s); }
export function clearStaffSession() { removeKey(STAFF_KEY); }

let onAuthError = null;
export function setAuthErrorHandler(fn) { onAuthError = fn; }

export async function staffCall(action, payload = {}) {
  const s = getStaffSession();
  if (!s || !s.token) throw new ApiError("Sin sesión", "auth");
  try {
    return await callApi(action, { token: s.token, ...payload });
  } catch (e) {
    if (e.code === "auth" && onAuthError) onAuthError(e);
    throw e;
  }
}

export const ROLES = ["Enfermero/a", "TENS", "Médico/a", "Kinesiólogo/a", "Psicólogo/a", "Trabajador/a social", "Otro"];
export const TURNOS = ["Día", "Noche", "Rotativo"];
export const INSUMOS = ["Pañales", "Pantuflas", "Pijama de 2 piezas", "Útiles de aseo", "Crema corporal", "Ropa limpia", "Documentos", "Otro"];
export const ETAPAS = ["Aguda", "Estabilización", "Destete", "Pre-alta"];
export const ESTADOS = [["activo", "Activo"], ["alta", "Alta de UCI"], ["fallecido", "Fallecido/a"], ["archivado", "Archivado"]];
export const REQ_STATE = { pendiente: ["Pendiente", "orange"], en_camino: ["En camino", "blue"], no_puede: ["No puede hoy", "orange"], recibido: ["Recibido", "green"], cancelada: ["Cancelada", "grey"] };

export function when(iso) {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d)) return String(iso);
  const today = new Date().toDateString() === d.toDateString();
  const t = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
  return today ? `hoy ${t}` : `${d.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} ${t}`;
}
export function ago(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime(); if (isNaN(ms)) return "";
  const m = Math.round(ms / 60000);
  if (m < 1) return "ahora"; if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24); return d === 1 ? "ayer" : `hace ${d} días`;
}
export function initials(name) { return String(name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?"; }
export function familyAppUrl() {
  const base = import.meta.env.BASE_URL || "/";
  return `${window.location.origin}${base}`;
}
