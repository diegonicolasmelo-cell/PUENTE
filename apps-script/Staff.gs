/**
 * Panel del equipo e interacción familia ↔ equipo.
 *
 * MODO DEMO (sin Google Workspace): el profesional entra con la clave de acceso del servicio
 * (columna clave_acceso de la hoja Servicios) más su nombre y rol. Recibe un token que identifica
 * su sesión y con el que firma cada acción; queda registrado en Profesionales y en Log.
 * La clave es un secreto compartido del servicio: cámbiala periódicamente y no la publiques.
 * Cuando exista cuenta institucional, este archivo es el único que cambia (requireStaff_).
 */

var ROLES = ["Enfermero/a", "TENS", "Médico/a", "Kinesiólogo/a", "Psicólogo/a", "Trabajador/a social", "Otro"];
var REQUEST_STATES = { pendiente: 1, en_camino: 1, no_puede: 1, recibido: 1, cancelada: 1 };
var CHECKLIST_KEYS = ["Shampoo", "Jabón de baño", "Crema corporal", "Cepillo de dientes", "Pasta dental", "Pijama de 2 piezas", "Pantuflas"];

// ─── Servicios ──────────────────────────────────────────────────────────────

function findServicio_(id) {
  var hit = findRowBy_("servicios", "id", id);
  if (!hit || !bool_(hit.rec.activo === "" ? "TRUE" : hit.rec.activo)) return null;
  return hit.rec;
}
function findServicioByClave_(clave) {
  var c = String(clave || "").trim();
  if (!c) return null;
  var rows = tableRows_("servicios").filter(function (r) { return String(r.rec.clave_acceso || "").trim().toUpperCase() === c.toUpperCase() && bool_(r.rec.activo === "" ? "TRUE" : r.rec.activo); });
  return rows.length ? rows[0].rec : null;
}
function publicServicio_(s) { return { id: String(s.id), nombre: String(s.nombre || s.id), piso: String(s.piso || "") }; }

function getServicio_(servicioId) {
  var s = findServicio_(servicioId);
  if (!s) throw apiError_("Servicio no encontrado", "not_found");
  return publicServicio_(s);
}

/** La familia escaneó el QR después de crear el perfil: asigna el servicio si aún no tiene. */
function setServicio_(code, servicioId) {
  var hit = findPatientByCode_(code);
  if (!hit) throw apiError_("Código no encontrado", "not_found");
  var s = findServicio_(servicioId);
  if (!s) throw apiError_("Servicio no encontrado", "not_found");
  if (hit.record.servicio_id && String(hit.record.servicio_id) !== String(s.id)) throw apiError_("El paciente ya pertenece a otro servicio; pide al equipo que lo cambie", "conflict");
  updateRow_("pacientes", hit.row, { servicio_id: s.id, actualizado: nowIso_() });
  logEvent_("setServicio", hit.record.id, s.nombre);
  return { servicio: publicServicio_(s) };
}

// ─── Solicitudes y mensajes (compartido) ────────────────────────────────────

function requestOut_(r) {
  return { id: r.id, patientId: r.paciente_id, tipo: r.tipo || "", texto: r.texto || "", nota: r.nota || "", prioridad: r.prioridad || "normal",
    estado: r.estado || "pendiente", creadoPor: r.creado_por || "", creadoEn: r.creado_en || "", respondidoEn: r.respondido_en || "",
    respuesta: r.respuesta || "", recibidoPor: r.recibido_por || "", recibidoEn: r.recibido_en || "" };
}
function messageOut_(m) {
  return { id: m.id, patientId: m.paciente_id, origen: m.origen || "equipo", autor: m.autor || "", texto: m.texto || "", creadoEn: m.creado_en || "", leidoEn: m.leido_en || "" };
}
function byDateAsc_(a, b) { return String(a.creadoEn).localeCompare(String(b.creadoEn)); }

function requestsOf_(patientId) {
  return tableRows_("solicitudes").filter(function (r) { return String(r.rec.paciente_id) === String(patientId) && r.rec.estado !== "cancelada"; })
    .map(function (r) { return requestOut_(r.rec); }).sort(byDateAsc_).reverse();
}
function messagesOf_(patientId) {
  return tableRows_("mensajes").filter(function (r) { return String(r.rec.paciente_id) === String(patientId); })
    .map(function (r) { return messageOut_(r.rec); }).sort(byDateAsc_);
}
/** Lo que la familia necesita junto con su perfil. */
function patientExtras_(patientId) {
  var mensajes = messagesOf_(patientId);
  return {
    solicitudes: requestsOf_(patientId),
    mensajes: mensajes,
    noLeidos: mensajes.filter(function (m) { return m.origen === "equipo" && !m.leidoEn; }).length,
  };
}

// ─── Familia → equipo ───────────────────────────────────────────────────────

function respondRequest_(code, requestId, respuesta) {
  var hit = findPatientByCode_(code);
  if (!hit) throw apiError_("Código no encontrado", "not_found");
  if (respuesta !== "en_camino" && respuesta !== "no_puede") throw apiError_("Respuesta no válida", "validation");
  var req = findRowBy_("solicitudes", "id", requestId);
  if (!req || String(req.rec.paciente_id) !== String(hit.record.id)) throw apiError_("Solicitud no encontrada", "not_found");
  if (req.rec.estado === "recibido" || req.rec.estado === "cancelada") throw apiError_("Esta solicitud ya está cerrada", "conflict");
  updateRow_("solicitudes", req.row, { estado: respuesta, respondido_en: nowIso_(), respuesta: respuesta === "en_camino" ? "Ya lo llevo" : "No puedo hoy" });
  logEvent_("respondRequest", hit.record.id, req.rec.texto + " → " + respuesta);
  return { solicitudes: requestsOf_(hit.record.id) };
}

function familySendMessage_(code, texto) {
  var hit = findPatientByCode_(code);
  if (!hit) throw apiError_("Código no encontrado", "not_found");
  var t = String(texto || "").trim();
  if (!t) throw apiError_("Escribe un mensaje", "validation");
  appendRecord_("mensajes", { id: newId_(), paciente_id: hit.record.id, origen: "familia", autor: hit.record.familiar_nombre || "Familia", texto: t.slice(0, 2000), creado_en: nowIso_(), leido_en: "" });
  logEvent_("familySendMessage", hit.record.id, t.slice(0, 80));
  return { mensajes: messagesOf_(hit.record.id) };
}

function familyReadMessages_(code) {
  var hit = findPatientByCode_(code);
  if (!hit) throw apiError_("Código no encontrado", "not_found");
  markRead_(hit.record.id, "equipo");
  return { noLeidos: 0 };
}

/** Marca como leídos los mensajes de `origen` de un paciente. */
function markRead_(patientId, origen) {
  var now = nowIso_();
  tableRows_("mensajes").forEach(function (r) {
    if (String(r.rec.paciente_id) === String(patientId) && r.rec.origen === origen && !r.rec.leido_en) updateRow_("mensajes", r.row, { leido_en: now });
  });
}

// ─── Acceso del equipo (modo demo) ──────────────────────────────────────────

function staffLogin_(clave, nombre, rol, turno) {
  var servicio = findServicioByClave_(clave);
  if (!servicio) throw apiError_("Clave de servicio incorrecta", "auth");
  var n = String(nombre || "").trim();
  if (!n) throw apiError_("Escribe tu nombre", "validation");
  var r = ROLES.indexOf(rol) >= 0 ? rol : "Otro";
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var existing = tableRows_("profesionales").filter(function (x) {
      return String(x.rec.servicio_id) === String(servicio.id) && String(x.rec.nombre || "").trim().toLowerCase() === n.toLowerCase() && String(x.rec.rol) === r;
    })[0];
    var token = randomToken_(32);
    var now = nowIso_();
    var prof;
    if (existing) {
      if (!bool_(existing.rec.activo === "" ? "TRUE" : existing.rec.activo)) throw apiError_("Tu acceso está desactivado; habla con el administrador", "auth");
      prof = updateRow_("profesionales", existing.row, { token: token, turno: turno || existing.rec.turno || "", ultimo_acceso: now });
    } else {
      prof = appendRecord_("profesionales", { id: newId_(), servicio_id: servicio.id, nombre: n, rol: r, turno: turno || "", email: "", token: token, activo: "TRUE", creado: now, ultimo_acceso: now });
    }
    logEvent_("staffLogin", "", n + " (" + r + ")", n);
    return { token: token, profesional: profesionalOut_(prof), servicio: publicServicio_(servicio) };
  } finally {
    lock.releaseLock();
  }
}

function profesionalOut_(p) { return { id: p.id, nombre: p.nombre || "", rol: p.rol || "", turno: p.turno || "" }; }

/** Valida el token y devuelve profesional + servicio. Toda acción del panel pasa por aquí. */
function requireStaff_(token) {
  var t = String(token || "").trim();
  if (t.length < 16) throw apiError_("Sesión no válida", "auth");
  var hit = findRowBy_("profesionales", "token", t);
  if (!hit || !bool_(hit.rec.activo === "" ? "TRUE" : hit.rec.activo)) throw apiError_("Sesión expirada; vuelve a entrar", "auth");
  var servicio = findServicio_(hit.rec.servicio_id);
  if (!servicio) throw apiError_("El servicio ya no está activo", "auth");
  return { prof: hit.rec, row: hit.row, servicio: servicio };
}

function staffMe_(token) {
  var s = requireStaff_(token);
  return { profesional: profesionalOut_(s.prof), servicio: publicServicio_(s.servicio) };
}

function staffUpdateMe_(token, req) {
  var s = requireStaff_(token);
  var patch = {};
  if (req.nombre && String(req.nombre).trim()) patch.nombre = String(req.nombre).trim();
  if (req.rol && ROLES.indexOf(req.rol) >= 0) patch.rol = req.rol;
  if (req.turno != null) patch.turno = String(req.turno);
  var prof = updateRow_("profesionales", s.row, patch);
  return { profesional: profesionalOut_(prof), servicio: publicServicio_(s.servicio) };
}

// ─── Tablero y detalle ──────────────────────────────────────────────────────

function patientSummary_(rec, reqs, msgs) {
  var checklist = splitList_(rec.checklist);
  var open = (reqs || []).filter(function (r) { return r.estado === "pendiente" || r.estado === "en_camino" || r.estado === "no_puede"; });
  var unread = (msgs || []).filter(function (m) { return m.origen === "familia" && !m.leidoEn; });
  var incompleto = !rec.educacion || !rec.vive_con || !rec.vive_donde || !rec.mensaje_familia;
  return {
    id: rec.id, code: rec.codigo, patName: rec.paciente_nombre || "", patNick: rec.apodo || "", patJob: rec.ocupacion || "",
    cama: rec.cama || "", etapa: normalizeStage_(rec.etapa), estado: rec.estado || "activo", servicioId: rec.servicio_id || "",
    famName: rec.familiar_nombre || "", famPhone: rec.familiar_whatsapp || "", ingreso: rec.ingreso || String(rec.creado || "").slice(0, 10),
    updatedAt: rec.actualizado || rec.creado || "", registradoPor: rec.registrado_por || "familia",
    utiles: { done: checklist.length, total: CHECKLIST_KEYS.length },
    pendientes: open.length, noLeidos: unread.length, incompleto: incompleto, sinFamiliar: !rec.familiar_nombre,
  };
}

function groupBy_(list, key) {
  var out = {};
  list.forEach(function (x) { var k = String(x[key]); (out[k] = out[k] || []).push(x); });
  return out;
}

function staffBoard_(token) {
  var s = requireStaff_(token);
  var reqs = groupBy_(tableRows_("solicitudes").map(function (r) { return requestOut_(r.rec); }), "patientId");
  var msgs = groupBy_(tableRows_("mensajes").map(function (r) { return messageOut_(r.rec); }), "patientId");
  var pacientes = [], sinServicio = [];
  tableRows_("pacientes").forEach(function (r) {
    var rec = r.rec;
    if (rec.estado === "archivado") return;
    var sum = patientSummary_(rec, reqs[rec.id], msgs[rec.id]);
    if (String(rec.servicio_id) === String(s.servicio.id)) pacientes.push(sum);
    else if (!rec.servicio_id && rec.estado !== "alta" && rec.estado !== "fallecido") sinServicio.push(sum);
  });
  var order = { activo: 0, alta: 1, fallecido: 2 };
  pacientes.sort(function (a, b) { return (order[a.estado] || 0) - (order[b.estado] || 0) || String(a.cama).localeCompare(String(b.cama), undefined, { numeric: true }) || a.patName.localeCompare(b.patName); });
  return { servicio: publicServicio_(s.servicio), profesional: profesionalOut_(s.prof), pacientes: pacientes, sinServicio: sinServicio, generadoEn: nowIso_() };
}

/** Paciente del servicio del profesional (o sin servicio, para poder adoptarlo). */
function requirePatient_(s, patientId, allowUnassigned) {
  var hit = findPatientById_(patientId);
  if (!hit) throw apiError_("Paciente no encontrado", "not_found");
  var sid = String(hit.rec.servicio_id || "");
  if (sid !== String(s.servicio.id) && !(allowUnassigned && !sid)) throw apiError_("Este paciente pertenece a otro servicio", "forbidden");
  return hit;
}

function staffPatient_(token, patientId) {
  var s = requireStaff_(token);
  var hit = requirePatient_(s, patientId, true);
  markRead_(hit.rec.id, "familia");
  var reqs = requestsOf_(hit.rec.id), msgs = messagesOf_(hit.rec.id);
  return {
    paciente: patientSummary_(hit.rec, reqs, msgs),
    profile: recordToProfile_(hit.rec),
    family: readFamily_(hit.rec.id),
    solicitudes: reqs,
    mensajes: msgs,
    servicio: publicServicio_(s.servicio),
  };
}

function staffUpdatePatient_(token, patientId, req) {
  var s = requireStaff_(token);
  var hit = requirePatient_(s, patientId, true);
  var patch = { actualizado: nowIso_() };
  var detail = [];
  if (req.etapa != null && req.etapa !== "") { patch.etapa = normalizeStage_(req.etapa); detail.push("etapa " + patch.etapa); }
  if (req.estado && ["activo", "alta", "fallecido", "archivado"].indexOf(req.estado) >= 0) { patch.estado = req.estado; detail.push("estado " + req.estado); }
  if (req.cama != null) { patch.cama = String(req.cama).trim(); detail.push("cama " + patch.cama); }
  if (req.asignar) { patch.servicio_id = s.servicio.id; detail.push("asignado a " + s.servicio.nombre); }
  var rec = updateRow_("pacientes", hit.row, patch);
  CacheService.getScriptCache().remove("content_v1_" + s.servicio.id);
  logEvent_("staffUpdatePatient", rec.id, detail.join(", "), s.prof.nombre);
  return { paciente: patientSummary_(rec, requestsOf_(rec.id), messagesOf_(rec.id)) };
}

function staffRegisterPatient_(token, req) {
  var s = requireStaff_(token);
  var patName = String(req.patName || "").trim();
  if (!patName) throw apiError_("Falta el nombre del paciente", "validation");
  var created = insertPatient_({ patName: patName, patNick: String(req.patNick || "").trim(), famName: "", hobbies: [], helpDevices: [], livesWith: [] }, [],
    { servicio_id: s.servicio.id, cama: String(req.cama || "").trim(), registrado_por: s.prof.nombre });
  logEvent_("staffRegisterPatient", created.patientId, patName + " cama " + (req.cama || "-"), s.prof.nombre);
  return created;
}

// ─── Solicitudes y mensajes del equipo ──────────────────────────────────────

function staffCreateRequest_(token, patientId, req) {
  var s = requireStaff_(token);
  var hit = requirePatient_(s, patientId, false);
  var texto = String(req.texto || req.tipo || "").trim();
  if (!texto) throw apiError_("Indica qué necesitas pedir", "validation");
  var rec = { id: newId_(), paciente_id: hit.rec.id, servicio_id: s.servicio.id, tipo: String(req.tipo || "Otro"), texto: texto.slice(0, 200),
    nota: String(req.nota || "").trim().slice(0, 500), prioridad: req.prioridad === "urgente" ? "urgente" : "normal", estado: "pendiente",
    creado_por: s.prof.nombre + " (" + s.prof.rol + ")", creado_en: nowIso_(), respondido_en: "", respuesta: "", recibido_por: "", recibido_en: "" };
  appendRecord_("solicitudes", rec);
  logEvent_("staffCreateRequest", hit.rec.id, texto, s.prof.nombre);
  return { solicitudes: requestsOf_(hit.rec.id), solicitud: requestOut_(rec), whatsapp: whatsappLink_(hit.rec, rec, s) };
}

/** Enlace wa.me con el texto listo; el profesional lo envía desde su propio WhatsApp. */
function whatsappLink_(patient, req, s) {
  var phone = String(patient.familiar_whatsapp || "").replace(/[^0-9]/g, "");
  if (!phone) return "";
  var text = "Hola " + (patient.familiar_nombre || "").split(" ")[0] + ", le escribe " + s.prof.nombre + " de " + s.servicio.nombre +
    ". Para " + (patient.apodo || (patient.paciente_nombre || "").split(" ")[0]) + " necesitamos: " + req.texto + (req.nota ? " (" + req.nota + ")" : "") +
    ". Puede confirmarlo en la app Puente UCI. Gracias.";
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);
}

function staffUpdateRequest_(token, requestId, estado) {
  var s = requireStaff_(token);
  if (!REQUEST_STATES[estado]) throw apiError_("Estado no válido", "validation");
  var req = findRowBy_("solicitudes", "id", requestId);
  if (!req || String(req.rec.servicio_id) !== String(s.servicio.id)) throw apiError_("Solicitud no encontrada", "not_found");
  var patch = { estado: estado };
  if (estado === "recibido") { patch.recibido_por = s.prof.nombre; patch.recibido_en = nowIso_(); }
  updateRow_("solicitudes", req.row, patch);
  logEvent_("staffUpdateRequest", req.rec.paciente_id, req.rec.texto + " → " + estado, s.prof.nombre);
  return { solicitudes: requestsOf_(req.rec.paciente_id) };
}

function staffSendMessage_(token, patientId, texto) {
  var s = requireStaff_(token);
  var hit = requirePatient_(s, patientId, false);
  var t = String(texto || "").trim();
  if (!t) throw apiError_("Escribe un mensaje", "validation");
  appendRecord_("mensajes", { id: newId_(), paciente_id: hit.rec.id, origen: "equipo", autor: s.prof.nombre + ", " + s.prof.rol, texto: t.slice(0, 2000), creado_en: nowIso_(), leido_en: "" });
  logEvent_("staffSendMessage", hit.rec.id, t.slice(0, 80), s.prof.nombre);
  return { mensajes: messagesOf_(hit.rec.id) };
}

function staffRequests_(token) {
  var s = requireStaff_(token);
  var names = {};
  tableRows_("pacientes").forEach(function (r) { names[r.rec.id] = { patName: r.rec.paciente_nombre || "", patNick: r.rec.apodo || "", cama: r.rec.cama || "" }; });
  var list = tableRows_("solicitudes").filter(function (r) { return String(r.rec.servicio_id) === String(s.servicio.id) && r.rec.estado !== "cancelada"; })
    .map(function (r) { var o = requestOut_(r.rec); var n = names[o.patientId] || {}; o.patName = n.patName || ""; o.patNick = n.patNick || ""; o.cama = n.cama || ""; return o; })
    .sort(byDateAsc_).reverse();
  return { solicitudes: list };
}

function staffThreads_(token) {
  var s = requireStaff_(token);
  var patients = {};
  tableRows_("pacientes").forEach(function (r) { if (String(r.rec.servicio_id) === String(s.servicio.id) && r.rec.estado !== "archivado") patients[r.rec.id] = r.rec; });
  var threads = {};
  tableRows_("mensajes").forEach(function (r) {
    var m = messageOut_(r.rec);
    if (!patients[m.patientId]) return;
    var t = threads[m.patientId] = threads[m.patientId] || { patientId: m.patientId, patName: patients[m.patientId].paciente_nombre || "", patNick: patients[m.patientId].apodo || "", cama: patients[m.patientId].cama || "", noLeidos: 0, ultimo: null, total: 0 };
    t.total++;
    if (m.origen === "familia" && !m.leidoEn) t.noLeidos++;
    if (!t.ultimo || String(m.creadoEn) > String(t.ultimo.creadoEn)) t.ultimo = m;
  });
  var list = Object.keys(threads).map(function (k) { return threads[k]; }).sort(function (a, b) { return String(b.ultimo.creadoEn).localeCompare(String(a.ultimo.creadoEn)); });
  return { hilos: list };
}
