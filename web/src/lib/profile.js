import { EMPTY_FORM, DEFAULT_TREE, CATALOG, CUSTOM_PREFIX } from "../data/defaults.js";

const ARRAY_FIELDS = ["hobbies", "helpDevices", "livesWith"];

/** Garantiza la forma del formulario aunque venga incompleto (caché antigua o planilla editada). */
export function normalizeForm(input) {
  const f = { ...EMPTY_FORM, ...(input || {}) };
  ARRAY_FIELDS.forEach((k) => { if (!Array.isArray(f[k])) f[k] = f[k] ? String(f[k]).split("|").map((s) => s.trim()).filter(Boolean) : []; });
  f.idCardApproved = !!f.idCardApproved;
  Object.keys(f).forEach((k) => { if (f[k] == null) f[k] = EMPTY_FORM[k] ?? ""; });
  return f;
}

export function normalizeTree(input) {
  if (!Array.isArray(input) || input.length === 0) return DEFAULT_TREE.map((n) => ({ ...n }));
  const nodes = input.map((n) => ({
    id: String(n.id || "custom_" + Math.random().toString(36).slice(2)),
    label: n.label || "", role: n.role || "", roleCustom: n.roleCustom || "",
    gen: [0, 1, 2].includes(Number(n.gen)) ? Number(n.gen) : 1,
    col: Number(n.col) || 0, emoji: n.emoji || "🧑", photo: n.photo || null, fixed: !!n.fixed,
  }));
  if (!nodes.some((n) => n.id === "pat")) nodes.unshift({ ...DEFAULT_TREE[0] });
  return nodes;
}

export function displayRole(node) {
  if (!node) return "";
  return node.role === "Otro" && node.roleCustom ? node.roleCustom : node.role;
}

export function patientNick(form) {
  return form.patNick || (form.patName || "").split(" ")[0] || "Paciente";
}

/** Agrupa gustos por categoría combinando catálogo, etiquetas [cat] y los campos "otro" del onboarding. */
export function splitHobbies(form) {
  const hobbies = form.hobbies || [];
  const pick = (cat) => hobbies.filter((h) => CATALOG[cat].includes(h));
  const custom = (cat) => hobbies.filter((h) => h.startsWith(CUSTOM_PREFIX[cat])).map((h) => h.slice(CUSTOM_PREFIX[cat].length));
  return {
    music:  [...pick("music"),  ...custom("music"),  ...(form.musicCustom ? [form.musicCustom] : [])],
    sport:  [...pick("sport"),  ...custom("sport"),  ...(form.sportCustom ? [form.sportCustom] : [])],
    daily:  [...pick("daily"),  ...custom("daily"),  ...(form.dailyCustom ? [form.dailyCustom] : [])],
    social: [...pick("social"), ...custom("social")],
  };
}

/** Lista plana de gustos legibles (sin prefijos) para tarjeta y perfil. */
export function readableHobbies(form) {
  const s = splitHobbies(form);
  return [...s.music, ...s.sport, ...s.daily, ...s.social];
}

/** Campos que solo se completan en el panel lateral: si faltan, la ficha sale con "No especificado". */
export function missingProfileFields(form) {
  const missing = [];
  if (!form.education) missing.push("nivel educacional");
  if (!(form.livesWith || []).length) missing.push("con quién vive");
  if (!form.livesWhere) missing.push("dónde vive");
  if (!form.familyMessage) missing.push("mensaje de la familia");
  return missing;
}

/** Carga útil que se envía al backend. */
export function buildPayload(form, treeNodes, checklist, prefs) {
  return {
    profile: { ...normalizeForm(form), checklist: checklist || {}, prefs: prefs || {} },
    family: normalizeTree(treeNodes).map(({ id, label, role, roleCustom, gen, col, emoji, photo, fixed }) => ({ id, label, role, roleCustom, gen, col, emoji, photo, fixed })),
  };
}
