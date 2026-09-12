/**
 * Puente UCI — backend en Google Apps Script.
 *
 * Puntos de entrada:
 *   doGet(e)   → sin ?action: sirve el envoltorio (Index.html). Con ?action=ping|getContent: API de lectura.
 *   doPost(e)  → API JSON. Cuerpo: {"action": "...", ...}. Se envía como text/plain para evitar CORS preflight.
 *   api(req)   → mismo dispatcher, invocado con google.script.run desde el envoltorio.
 *
 * Respuestas: { ok: true, data } | { ok: false, error, code }
 */
var APP_VERSION = "1.1.0";

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action) {
    var allowed = { ping: true, getContent: true, getServicio: true };
    if (!allowed[p.action]) return jsonOutput_(fail_("Esta acción requiere POST", "method"));
    return jsonOutput_(handleRequest_({ action: p.action, servicioId: p.servicioId || p.s || "" }));
  }
  try {
    return HtmlService.createHtmlOutputFromFile("Index")
      .setTitle("Puente UCI")
      .addMetaTag("viewport", "width=device-width, initial-scale=1, viewport-fit=cover")
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) {
    return HtmlService.createHtmlOutput(
      "<!doctype html><meta charset='utf-8'><title>Puente UCI</title>" +
      "<body style='font-family:sans-serif;padding:32px;max-width:560px'><h2>Puente UCI · API activa</h2>" +
      "<p>El envoltorio no está cargado. Ejecuta <code>npm run build:gas</code> en <code>web/</code> y sube " +
      "<code>apps-script/Index.html</code>, o usa la PWA publicada en GitHub Pages apuntando a esta URL.</p>" +
      "<p>Prueba: <a href='?action=ping'>?action=ping</a></p></body>"
    ).setTitle("Puente UCI");
  }
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse((e && e.postData && e.postData.contents) || "{}");
  } catch (err) {
    return jsonOutput_(fail_("JSON inválido", "bad_request"));
  }
  return jsonOutput_(handleRequest_(req));
}

/** Llamado desde el envoltorio con google.script.run.api(req). Devuelve string JSON (evita problemas de serialización). */
function api(req) {
  return JSON.stringify(handleRequest_(req || {}));
}

function handleRequest_(req) {
  var action = String(req.action || "");
  try {
    switch (action) {
      case "ping":          return ok_({ time: new Date().toISOString(), version: APP_VERSION });
      case "getContent":    return ok_(getContent_(req.servicioId));
      case "getServicio":   return ok_(getServicio_(req.servicioId));
      case "createProfile": return ok_(createProfile_(req.profile, req.family, req.servicioId));
      case "getProfile":    return ok_(getProfile_(req.code));
      case "updateProfile": return ok_(updateProfile_(req.code, req.profile, req.family));
      case "setServicio":   return ok_(setServicio_(req.code, req.servicioId));
      // Interacción familia → equipo
      case "respondRequest":     return ok_(respondRequest_(req.code, req.requestId, req.respuesta));
      case "familySendMessage":  return ok_(familySendMessage_(req.code, req.texto));
      case "familyReadMessages": return ok_(familyReadMessages_(req.code));
      // Panel del equipo (modo demo: clave de servicio + token por profesional)
      case "staffLogin":           return ok_(staffLogin_(req.clave, req.nombre, req.rol, req.turno));
      case "staffMe":              return ok_(staffMe_(req.token));
      case "staffUpdateMe":        return ok_(staffUpdateMe_(req.token, req));
      case "staffBoard":           return ok_(staffBoard_(req.token));
      case "staffPatient":         return ok_(staffPatient_(req.token, req.patientId));
      case "staffUpdatePatient":   return ok_(staffUpdatePatient_(req.token, req.patientId, req));
      case "staffRegisterPatient": return ok_(staffRegisterPatient_(req.token, req));
      case "staffCreateRequest":   return ok_(staffCreateRequest_(req.token, req.patientId, req));
      case "staffUpdateRequest":   return ok_(staffUpdateRequest_(req.token, req.requestId, req.estado));
      case "staffSendMessage":     return ok_(staffSendMessage_(req.token, req.patientId, req.texto));
      case "staffRequests":        return ok_(staffRequests_(req.token));
      case "staffThreads":         return ok_(staffThreads_(req.token));
      default:              return fail_("Acción desconocida: " + action, "bad_request");
    }
  } catch (err) {
    if (err && err.apiCode) return fail_(err.message, err.apiCode);
    logEvent_("error", "", action + ": " + (err && err.message ? err.message : String(err)));
    return fail_("Error interno del servidor", "server");
  }
}

function ok_(data) { return { ok: true, data: data }; }
function fail_(message, code) { return { ok: false, error: message, code: code || "server" }; }

function apiError_(message, code) {
  var e = new Error(message);
  e.apiCode = code || "server";
  return e;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ─── Contenido editable (Etapas, FAQ, Videos, Config) ───────────────────────

function getContent_(servicioId) {
  var cache = CacheService.getScriptCache();
  var key = "content_v1_" + String(servicioId || "");
  var cached = cache.get(key);
  if (cached) { try { return JSON.parse(cached); } catch (e) { /* recalcular */ } }
  var content = {
    etapas: readEtapas_(),
    faq: readFaq_(),
    videos: readVideos_(),
    config: readConfig_(),
    version: new Date().toISOString(),
  };
  // Un servicio puede sobrescribir horario, sala, teléfono y hora de informe
  var servicio = servicioId ? findServicio_(servicioId) : null;
  if (servicio) {
    content.config.nombre_unidad = servicio.nombre;
    if (servicio.horario_visitas) content.config.horario_visitas = servicio.horario_visitas;
    if (servicio.sala) content.config.sala = servicio.sala;
    if (servicio.telefono) content.config.telefono_uci = servicio.telefono;
    if (servicio.hora_informe) content.config.hora_informe = servicio.hora_informe;
    content.servicio = publicServicio_(servicio);
  }
  try { cache.put(key, JSON.stringify(content), 300); } catch (e) { /* >100KB: sin caché */ }
  return content;
}

// ─── Perfiles ───────────────────────────────────────────────────────────────

function createProfile_(profile, family, servicioId) {
  profile = profile || {};
  if (!String(profile.patName || "").trim()) throw apiError_("Falta el nombre del paciente", "validation");
  if (!String(profile.famName || "").trim()) throw apiError_("Falta el nombre del familiar", "validation");
  var servicio = servicioId ? findServicio_(servicioId) : null;   // un QR inválido no bloquea el registro
  var created = insertPatient_(profile, family, { servicio_id: servicio ? servicio.id : "", registrado_por: "familia" });
  logEvent_("createProfile", created.patientId, profile.patName + (servicio ? " · " + servicio.nombre : ""));
  created.servicio = servicio ? publicServicio_(servicio) : null;
  return created;
}

/** Inserta un paciente (usado por la familia y por el panel del equipo). */
function insertPatient_(profile, family, extra) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var id = Utilities.getUuid();
    var code = generateUniqueCode_();
    var now = new Date().toISOString();
    var base = { id: id, codigo: code, creado: now, actualizado: now, etapa: 1, estado: "activo",
      servicio_id: (extra && extra.servicio_id) || "", cama: (extra && extra.cama) || "", ingreso: now.slice(0, 10),
      registrado_por: (extra && extra.registrado_por) || "familia" };
    appendPatientRow_(profile, base);
    writeFamily_(id, family || []);
    return { code: code, patientId: id, etapa: 1, estado: "activo", updatedAt: now, cama: base.cama };
  } finally {
    lock.releaseLock();
  }
}

function getProfile_(code) {
  var hit = findPatientByCode_(code);
  if (!hit) throw apiError_("Código no encontrado", "not_found");
  var rec = hit.record;
  logEvent_("getProfile", rec.id, "");
  var extras = patientExtras_(rec.id);
  var servicio = rec.servicio_id ? findServicio_(rec.servicio_id) : null;
  return {
    code: rec.codigo,
    patientId: rec.id,
    etapa: normalizeStage_(rec.etapa),
    estado: rec.estado || "activo",
    updatedAt: rec.actualizado || rec.creado || "",
    profile: recordToProfile_(rec),
    family: readFamily_(rec.id),
    servicio: servicio ? publicServicio_(servicio) : null,
    cama: rec.cama || "",
    solicitudes: extras.solicitudes,
    mensajes: extras.mensajes,
    noLeidos: extras.noLeidos,
  };
}

function updateProfile_(code, profile, family) {
  var hit = findPatientByCode_(code);
  if (!hit) throw apiError_("Código no encontrado", "not_found");
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var now = new Date().toISOString();
    updatePatientRow_(hit.row, profile || {}, now);
    if (family) writeFamily_(hit.record.id, family);
    logEvent_("updateProfile", hit.record.id, "");
    var servicio = hit.record.servicio_id ? findServicio_(hit.record.servicio_id) : null;
    return { updatedAt: now, etapa: normalizeStage_(hit.record.etapa), estado: hit.record.estado || "activo", code: hit.record.codigo, patientId: hit.record.id,
      cama: hit.record.cama || "", servicio: servicio ? publicServicio_(servicio) : null };
  } finally {
    lock.releaseLock();
  }
}

function normalizeStage_(v) {
  var n = parseInt(v, 10);
  return (n >= 1 && n <= 4) ? n : 1;
}
