/**
 * Acceso a Google Sheets: creación de hojas, lectura/escritura de perfiles, familia, contenido y log.
 * Ejecuta setupSpreadsheet() una vez desde el editor para crear las hojas con contenido semilla.
 */
var SHEETS = {
  pacientes: "Pacientes", familia: "Familia", etapas: "Etapas", faq: "FAQ", videos: "Videos", config: "Config", log: "Log",
};

var HEADERS = {
  pacientes: ["id", "codigo", "creado", "actualizado", "etapa", "estado",
    "familiar_nombre", "familiar_whatsapp", "paciente_nombre", "apodo", "ocupacion", "educacion",
    "gustos", "musica_otro", "musica_favorita", "deporte_otro", "cotidiano_otro", "comentario",
    "ayudas_tecnicas", "vive_con", "vive_donde", "zona", "mensaje_familia", "tarjeta_aprobada", "checklist", "prefs"],
  familia: ["paciente_id", "nodo_id", "nombre", "vinculo", "vinculo_otro", "generacion", "columna", "emoji", "foto", "fijo"],
  etapas: ["id", "etiqueta", "subtitulo", "descripcion"],
  faq: ["categoria", "tag", "pregunta", "respuesta", "orden"],
  videos: ["emoji", "titulo", "descripcion", "duracion", "url", "orden"],
  config: ["clave", "valor"],
  log: ["fecha", "accion", "paciente_id", "detalle"],
};

var LIST_SEP = " | ";
var MAX_CELL = 49000;        // límite de Sheets: 50.000 caracteres por celda
var CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I

// ─── Planilla ───────────────────────────────────────────────────────────────

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw apiError_("No hay planilla: vincula el script a una hoja o define SPREADSHEET_ID en las propiedades del script", "config");
  return ss;
}

function getSheet_(key) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(SHEETS[key]);
  if (!sheet) sheet = ensureSheet_(ss, key);
  return sheet;
}

/** Crea la hoja si falta, escribe encabezados si faltan y agrega columnas nuevas al final sin borrar datos. */
function ensureSheet_(ss, key) {
  var name = SHEETS[key];
  var headers = HEADERS[key];
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var current = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (v) { return String(v || "").trim(); });
  if (!current[0]) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var missing = headers.filter(function (h) { return current.indexOf(h) === -1; });
    if (missing.length) sheet.getRange(1, current.filter(String).length + 1, 1, missing.length).setValues([missing]);
  }
  var width = Math.max(sheet.getLastColumn(), headers.length);
  sheet.getRange(1, 1, 1, width).setFontWeight("bold").setBackground("#CAF0F8");
  sheet.setFrozenRows(1);
  // Todo como texto plano: evita que teléfonos, códigos o "=" se interpreten como números o fórmulas.
  sheet.getRange(1, 1, sheet.getMaxRows(), width).setNumberFormat("@");
  return sheet;
}

function headerIndex_(sheet) {
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var row = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var idx = {};
  row.forEach(function (h, i) { var k = String(h || "").trim(); if (k) idx[k] = i; });
  return idx;
}

/**
 * Prepara la planilla: hojas, encabezados y contenido semilla (solo si la hoja está vacía).
 * Es idempotente: se puede ejecutar varias veces sin perder datos.
 */
function setupSpreadsheet() {
  var ss = getSpreadsheet_();
  Object.keys(SHEETS).forEach(function (key) { ensureSheet_(ss, key); });
  seedIfEmpty_(ss.getSheetByName(SHEETS.etapas), SEED_ETAPAS.map(function (e) { return [e.id, e.label, e.sub, e.desc]; }));
  seedIfEmpty_(ss.getSheetByName(SHEETS.faq), SEED_FAQ.map(function (f, i) { return [f.categoria, f.tag || "", f.q, f.a, i + 1]; }));
  seedIfEmpty_(ss.getSheetByName(SHEETS.videos), SEED_VIDEOS.map(function (v, i) { return [v.emoji, v.title, v.desc, v.dur, v.url || "", i + 1]; }));
  seedIfEmpty_(ss.getSheetByName(SHEETS.config), Object.keys(SEED_CONFIG).map(function (k) { return [k, SEED_CONFIG[k]]; }));
  var first = ss.getSheetByName(SHEETS.pacientes);
  if (ss.getSheets()[0].getName() !== SHEETS.pacientes) ss.setActiveSheet(first) && ss.moveActiveSheet(1);
  var extra = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Sheet1");
  if (extra && extra.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(extra);
  CacheService.getScriptCache().remove("content_v1");
  Logger.log("Planilla lista: " + ss.getUrl());
  return ss.getUrl();
}

function seedIfEmpty_(sheet, rows) {
  if (!sheet || sheet.getLastRow() > 1 || !rows.length) return;
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

// ─── Utilidades de celdas ───────────────────────────────────────────────────

function joinList_(arr) {
  if (!Array.isArray(arr)) return arr == null ? "" : String(arr);
  return arr.map(function (s) { return String(s).replace(/\|/g, "/").trim(); }).filter(String).join(LIST_SEP);
}
function splitList_(s) {
  if (Array.isArray(s)) return s;
  return String(s || "").split("|").map(function (x) { return x.trim(); }).filter(String);
}
function cell_(v) {
  if (v == null) return "";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  var s = typeof v === "object" ? JSON.stringify(v) : String(v);
  return s.length > MAX_CELL ? s.slice(0, MAX_CELL) : s;
}
function bool_(v) { return v === true || String(v).toUpperCase() === "TRUE" || String(v) === "1"; }
function json_(v, fallback) { try { return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }

// ─── Códigos de acceso ──────────────────────────────────────────────────────

function normalizeCode_(code) {
  var clean = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 8) return "";
  return clean.slice(0, 4) + "-" + clean.slice(4);
}

function generateUniqueCode_() {
  for (var attempt = 0; attempt < 10; attempt++) {
    var code = "";
    for (var i = 0; i < 8; i++) code += CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length));
    var formatted = code.slice(0, 4) + "-" + code.slice(4);
    if (!findPatientByCode_(formatted)) return formatted;
  }
  throw apiError_("No se pudo generar un código único", "server");
}

// ─── Pacientes ──────────────────────────────────────────────────────────────

function profileToRecord_(profile, base) {
  profile = profile || {};
  var checklist = profile.checklist && typeof profile.checklist === "object"
    ? Object.keys(profile.checklist).filter(function (k) { return profile.checklist[k]; })
    : [];
  return {
    id: base.id, codigo: base.codigo, creado: base.creado, actualizado: base.actualizado, etapa: base.etapa, estado: base.estado,
    familiar_nombre: profile.famName, familiar_whatsapp: profile.famPhone,
    paciente_nombre: profile.patName, apodo: profile.patNick, ocupacion: profile.patJob, educacion: profile.education,
    gustos: joinList_(profile.hobbies), musica_otro: profile.musicCustom, musica_favorita: profile.musicExtra,
    deporte_otro: profile.sportCustom, cotidiano_otro: profile.dailyCustom, comentario: profile.extra,
    ayudas_tecnicas: joinList_(profile.helpDevices), vive_con: joinList_(profile.livesWith),
    vive_donde: profile.livesWhere, zona: profile.zonaType, mensaje_familia: profile.familyMessage,
    tarjeta_aprobada: !!profile.idCardApproved, checklist: joinList_(checklist),
    prefs: profile.prefs && typeof profile.prefs === "object" ? profile.prefs : {},
  };
}

function recordToProfile_(rec) {
  var checklist = {};
  splitList_(rec.checklist).forEach(function (k) { checklist[k] = true; });
  return {
    famName: rec.familiar_nombre || "", famPhone: rec.familiar_whatsapp || "",
    patName: rec.paciente_nombre || "", patNick: rec.apodo || "", patJob: rec.ocupacion || "", education: rec.educacion || "",
    hobbies: splitList_(rec.gustos), musicCustom: rec.musica_otro || "", musicExtra: rec.musica_favorita || "",
    sportCustom: rec.deporte_otro || "", dailyCustom: rec.cotidiano_otro || "", extra: rec.comentario || "",
    helpDevices: splitList_(rec.ayudas_tecnicas), livesWith: splitList_(rec.vive_con),
    livesWhere: rec.vive_donde || "", zonaType: rec.zona || "", familyMessage: rec.mensaje_familia || "",
    idCardApproved: bool_(rec.tarjeta_aprobada), checklist: checklist, prefs: json_(rec.prefs, {}),
  };
}

function appendPatientRow_(profile, base) {
  var sheet = getSheet_("pacientes");
  var idx = headerIndex_(sheet);
  var rec = profileToRecord_(profile, base);
  var width = Math.max(sheet.getLastColumn(), HEADERS.pacientes.length);
  var row = new Array(width).fill("");
  Object.keys(rec).forEach(function (k) { if (idx[k] != null) row[idx[k]] = cell_(rec[k]); });
  sheet.appendRow(row);
}

/** Columnas que solo edita el equipo desde la planilla: nunca las sobrescribe la app. */
var STAFF_COLUMNS = { id: 1, codigo: 1, creado: 1, etapa: 1, estado: 1 };

function updatePatientRow_(rowNumber, profile, now) {
  var sheet = getSheet_("pacientes");
  var idx = headerIndex_(sheet);
  var width = Math.max(sheet.getLastColumn(), HEADERS.pacientes.length);
  var range = sheet.getRange(rowNumber, 1, 1, width);
  var row = range.getValues()[0];
  var rec = profileToRecord_(profile, { actualizado: now });
  Object.keys(rec).forEach(function (k) {
    if (STAFF_COLUMNS[k] || idx[k] == null) return;
    row[idx[k]] = cell_(rec[k]);
  });
  range.setValues([row]);
}

function rowToRecord_(row, idx) {
  var rec = {};
  Object.keys(idx).forEach(function (k) { rec[k] = row[idx[k]]; });
  return rec;
}

/** Busca por código en la columna `codigo`. Devuelve { row, record } o null. */
function findPatientByCode_(code) {
  var formatted = normalizeCode_(code);
  if (!formatted) return null;
  var sheet = getSheet_("pacientes");
  var idx = headerIndex_(sheet);
  if (idx.codigo == null || sheet.getLastRow() < 2) return null;
  var col = idx.codigo + 1;
  var found = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).createTextFinder(formatted).matchEntireCell(true).matchCase(false).findNext();
  if (!found) return null;
  var r = found.getRow();
  var row = sheet.getRange(r, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  return { row: r, record: rowToRecord_(row, idx) };
}

// ─── Familia ────────────────────────────────────────────────────────────────

function readFamily_(patientId) {
  var sheet = getSheet_("familia");
  if (sheet.getLastRow() < 2) return [];
  var idx = headerIndex_(sheet);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 1)).getValues();
  return values.filter(function (row) { return String(row[idx.paciente_id]) === String(patientId); }).map(function (row) {
    var rec = rowToRecord_(row, idx);
    return {
      id: rec.nodo_id, label: rec.nombre || "", role: rec.vinculo || "", roleCustom: rec.vinculo_otro || "",
      gen: parseInt(rec.generacion, 10) || 0, col: parseInt(rec.columna, 10) || 0,
      emoji: rec.emoji || "🧑", photo: rec.foto || null, fixed: bool_(rec.fijo),
    };
  });
}

/** Reemplaza todas las filas del paciente por la lista recibida. */
function writeFamily_(patientId, family) {
  if (!Array.isArray(family)) return;
  var sheet = getSheet_("familia");
  var idx = headerIndex_(sheet);
  if (sheet.getLastRow() >= 2) {
    var col = idx.paciente_id + 1;
    var matches = sheet.getRange(2, col, sheet.getLastRow() - 1, 1).createTextFinder(String(patientId)).matchEntireCell(true).findAll();
    matches.map(function (r) { return r.getRow(); }).sort(function (a, b) { return b - a; }).forEach(function (r) { sheet.deleteRow(r); });
  }
  var width = Math.max(sheet.getLastColumn(), HEADERS.familia.length);
  var rows = family.map(function (n) {
    var rec = {
      paciente_id: patientId, nodo_id: n.id, nombre: n.label, vinculo: n.role, vinculo_otro: n.roleCustom,
      generacion: n.gen, columna: n.col, emoji: n.emoji, foto: (n.photo && String(n.photo).length <= MAX_CELL) ? n.photo : "", fijo: !!n.fixed,
    };
    var row = new Array(width).fill("");
    Object.keys(rec).forEach(function (k) { if (idx[k] != null) row[idx[k]] = cell_(rec[k]); });
    return row;
  });
  if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, width).setValues(rows);
}

// ─── Contenido ──────────────────────────────────────────────────────────────

function readTable_(key) {
  var sheet = getSheet_(key);
  if (sheet.getLastRow() < 2) return [];
  var idx = headerIndex_(sheet);
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, Math.max(sheet.getLastColumn(), 1)).getValues();
  return values.map(function (row) { return rowToRecord_(row, idx); }).filter(function (rec) {
    return Object.keys(rec).some(function (k) { return String(rec[k]).trim() !== ""; });
  });
}

function readEtapas_() {
  var rows = readTable_("etapas").map(function (r) { return { id: parseInt(r.id, 10), label: String(r.etiqueta), sub: String(r.subtitulo), desc: String(r.descripcion) }; })
    .filter(function (r) { return r.id >= 1 && r.id <= 4; }).sort(function (a, b) { return a.id - b.id; });
  return rows.length === 4 ? rows : SEED_ETAPAS;
}

function readFaq_() {
  var rows = readTable_("faq");
  rows.sort(function (a, b) { return (parseFloat(a.orden) || 0) - (parseFloat(b.orden) || 0); });
  var out = {};
  rows.forEach(function (r) {
    var cat = String(r.categoria || "").trim();
    if (!cat || !String(r.pregunta || "").trim()) return;
    if (!out[cat]) out[cat] = [];
    var item = { q: String(r.pregunta), a: String(r.respuesta || "") };
    if (String(r.tag || "").trim()) item.tag = String(r.tag).trim();
    out[cat].push(item);
  });
  return Object.keys(out).length ? out : seedFaqObject_();
}

function readVideos_() {
  var rows = readTable_("videos");
  rows.sort(function (a, b) { return (parseFloat(a.orden) || 0) - (parseFloat(b.orden) || 0); });
  var out = rows.filter(function (r) { return String(r.titulo || "").trim(); }).map(function (r) {
    return { emoji: String(r.emoji || "▶️"), title: String(r.titulo), desc: String(r.descripcion || ""), dur: String(r.duracion || ""), url: String(r.url || "").trim() };
  });
  return out.length ? out : SEED_VIDEOS;
}

function readConfig_() {
  var out = {};
  Object.keys(SEED_CONFIG).forEach(function (k) { out[k] = SEED_CONFIG[k]; });
  readTable_("config").forEach(function (r) {
    var k = String(r.clave || "").trim();
    if (k && String(r.valor || "").trim() !== "") out[k] = String(r.valor);
  });
  return out;
}

// ─── Log ────────────────────────────────────────────────────────────────────

function logEvent_(action, patientId, detail) {
  try {
    getSheet_("log").appendRow([new Date().toISOString(), action, patientId || "", String(detail || "").slice(0, 500)]);
  } catch (e) { /* el log nunca bloquea una operación */ }
}
