/**
 * Puente UCI — raíz de la aplicación.
 * Conserva el modelo de estado del prototipo (form, treeNodes, checklist, preferencias) y agrega:
 * sesión con código de acceso, caché local, sincronización con Apps Script/Sheets y contenido remoto.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import "./styles/app.css";
import Onboarding from "./screens/Onboarding.jsx";
import Shell from "./Shell.jsx";
import { FAQ_DATA, JOURNEY_STEPS, VIDEOS, CONFIG_DEFAULTS, EMPTY_FORM, DEFAULT_TREE } from "./data/defaults.js";
import { KEYS, loadJSON, saveJSON, clearAll } from "./lib/storage.js";
import { callApi, getMode } from "./lib/api.js";
import { normalizeForm, normalizeTree, buildPayload } from "./lib/profile.js";
import { normalizeStage } from "./lib/journey.js";

const DEFAULT_CONTENT = { etapas: JOURNEY_STEPS, faq: FAQ_DATA, videos: VIDEOS, config: CONFIG_DEFAULTS, version: "local" };
const EMPTY_SESSION = { code: null, patientId: null, etapa: 1, estado: "activo", updatedAt: null, servicioId: "", servicio: null, cama: "", solicitudes: [], mensajes: [], noLeidos: 0 };

/** El QR de cada servicio abre la app con ?s=<id>; se guarda y se limpia de la URL. */
function readServicioFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const s = (params.get("s") || params.get("servicio") || "").trim();
    if (s) window.history.replaceState(null, "", window.location.pathname + window.location.hash);
    return s;
  } catch (_) { return ""; }
}
const REFRESH_MS = 5 * 60 * 1000;

/** Acepta el contenido remoto solo si tiene la forma esperada; lo demás se completa con los valores por defecto. */
function mergeContent(remote) {
  if (!remote || typeof remote !== "object") return DEFAULT_CONTENT;
  const etapas = Array.isArray(remote.etapas) && remote.etapas.length === 4 ? remote.etapas : DEFAULT_CONTENT.etapas;
  const faq = remote.faq && typeof remote.faq === "object" && Object.keys(remote.faq).length ? remote.faq : DEFAULT_CONTENT.faq;
  const videos = Array.isArray(remote.videos) && remote.videos.length ? remote.videos : DEFAULT_CONTENT.videos;
  const config = { ...CONFIG_DEFAULTS, ...((remote.config && typeof remote.config === "object") ? remote.config : {}) };
  Object.keys(config).forEach((k) => { if (config[k] === "" || config[k] == null) config[k] = CONFIG_DEFAULTS[k]; });
  return { etapas, faq, videos, config, version: remote.version || "remote" };
}

export default function App() {
  const mode = getMode();
  const [phase, setPhase] = useState("boot");
  const [form, setForm] = useState(() => normalizeForm(EMPTY_FORM));
  const [treeNodes, setTreeNodes] = useState(() => normalizeTree(DEFAULT_TREE));
  const [checklist, setChecklist] = useState({});
  const [prefs, setPrefs] = useState({ darkMode: false, notifs: true });
  const [session, setSession] = useState(EMPTY_SESSION);
  const [content, setContent] = useState(() => mergeContent(loadJSON(KEYS.content)));
  const [sync, setSync] = useState({ online: typeof navigator === "undefined" ? true : navigator.onLine, pending: !!loadJSON(KEYS.pending, false), busy: false, lastError: null });
  const [toast, setToast] = useState(null);

  const latest = useRef({});
  latest.current = { form, treeNodes, checklist, prefs, session };
  const toastTimer = useRef(null);
  const syncingRef = useRef(false);
  const queuedRef = useRef(false);
  const lastRefreshRef = useRef(0);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const applyRemoteProfile = useCallback((data) => {
    if (!data) return;
    if (data.profile) {
      const p = normalizeForm(data.profile);
      setForm(p);
      setChecklist(data.profile.checklist && typeof data.profile.checklist === "object" ? data.profile.checklist : {});
      if (data.profile.prefs && typeof data.profile.prefs === "object") setPrefs((cur) => ({ ...cur, ...data.profile.prefs }));
    }
    if (data.family) setTreeNodes(normalizeTree(data.family));
    setSession((s) => ({
      ...s,
      code: data.code || s.code,
      patientId: data.patientId || s.patientId,
      etapa: normalizeStage(data.etapa, s.etapa),
      estado: data.estado || s.estado,
      updatedAt: data.updatedAt || s.updatedAt,
      servicio: data.servicio || s.servicio,
      servicioId: (data.servicio && data.servicio.id) || s.servicioId,
      cama: data.cama != null ? data.cama : s.cama,
      solicitudes: Array.isArray(data.solicitudes) ? data.solicitudes : s.solicitudes,
      mensajes: Array.isArray(data.mensajes) ? data.mensajes : s.mensajes,
      noLeidos: typeof data.noLeidos === "number" ? data.noLeidos : s.noLeidos,
    }));
  }, []);

  /** Sube el perfil (crea o actualiza). Devuelve true si quedó sincronizado. */
  const syncNow = useCallback(async ({ userInitiated = false, overrides = {} } = {}) => {
    if (mode === "local") { saveJSON(KEYS.pending, true); setSync((s) => ({ ...s, pending: true })); return false; }
    if (syncingRef.current) { queuedRef.current = true; return false; }
    syncingRef.current = true;
    setSync((s) => ({ ...s, busy: true }));
    const cur = { ...latest.current, ...overrides };
    const payload = buildPayload(cur.form, cur.treeNodes, cur.checklist, cur.prefs);
    try {
      let data;
      if (cur.session.code) data = await callApi("updateProfile", { code: cur.session.code, ...payload });
      else data = await callApi("createProfile", { ...payload, servicioId: cur.session.servicioId || "" });
      setSession((s) => ({ ...s, code: data.code || s.code, patientId: data.patientId || s.patientId, etapa: normalizeStage(data.etapa, s.etapa), estado: data.estado || s.estado, updatedAt: data.updatedAt || new Date().toISOString(),
        servicio: data.servicio || s.servicio, servicioId: (data.servicio && data.servicio.id) || s.servicioId, cama: data.cama != null ? data.cama : s.cama }));
      saveJSON(KEYS.pending, false);
      setSync((s) => ({ ...s, busy: false, pending: false, lastError: null }));
      return true;
    } catch (e) {
      saveJSON(KEYS.pending, true);
      setSync((s) => ({ ...s, busy: false, pending: true, lastError: e.message || "Error" }));
      if (e.code === "not_found" && cur.session.code) {
        // El perfil ya no está en la planilla: se volverá a crear en el próximo intento.
        setSession((s) => ({ ...s, code: null, patientId: null }));
        showToast("⚠️ El perfil no existe en el servidor; se creará de nuevo");
      } else if (userInitiated) {
        showToast(e.code === "network" || e.code === "timeout" ? "📶 Sin conexión: guardado en el dispositivo" : `⚠️ ${e.message}`);
      }
      return false;
    } finally {
      syncingRef.current = false;
      if (queuedRef.current) { queuedRef.current = false; setTimeout(() => syncNow(), 50); }
    }
  }, [mode, showToast]);

  const refreshContent = useCallback(async (servicioIdArg) => {
    if (mode === "local") return;
    try {
      const data = await callApi("getContent", { servicioId: servicioIdArg != null ? servicioIdArg : (latest.current.session.servicioId || "") });
      const merged = mergeContent(data);
      setContent(merged);
      saveJSON(KEYS.content, merged);
    } catch (_) { /* se usa la caché o los valores por defecto */ }
  }, [mode]);

  /** Trae el perfil desde la planilla (etapa, estado y cambios hechos desde otro dispositivo). */
  const refreshProfile = useCallback(async (codeArg) => {
    const code = codeArg || latest.current.session.code;
    if (mode === "local" || !code) return;
    if (loadJSON(KEYS.pending, false)) { syncNow(); return; }   // primero suben los cambios locales
    try {
      const data = await callApi("getProfile", { code });
      applyRemoteProfile(data);
      lastRefreshRef.current = Date.now();
    } catch (e) {
      if (e.code === "not_found") { setSession((x) => ({ ...x, code: null, patientId: null })); saveJSON(KEYS.pending, true); setSync((x) => ({ ...x, pending: true })); }
    }
  }, [mode, syncNow, applyRemoteProfile]);

  // ── Arranque: caché local → pantalla; luego red en segundo plano ──
  useEffect(() => {
    const savedSession = loadJSON(KEYS.session);
    const savedProfile = loadJSON(KEYS.profile);
    if (savedProfile && savedProfile.form) {
      setForm(normalizeForm(savedProfile.form));
      setTreeNodes(normalizeTree(savedProfile.treeNodes));
      setChecklist(savedProfile.checklist || {});
      setPrefs((p) => ({ ...p, ...(savedProfile.prefs || {}) }));
    }
    const servicioFromQr = readServicioFromUrl();
    const mergedSession = { ...EMPTY_SESSION, ...(savedSession || {}) };
    if (servicioFromQr) mergedSession.servicioId = servicioFromQr;
    if (savedSession || servicioFromQr) setSession(mergedSession);
    // Perfil creado antes de escanear el QR: se asigna al servicio ahora
    if (servicioFromQr && savedSession && savedSession.code && (!savedSession.servicioId || savedSession.servicioId !== servicioFromQr) && getMode() !== "local") {
      callApi("setServicio", { code: savedSession.code, servicioId: servicioFromQr }).then((d) => { if (d && d.servicio) setSession((x) => ({ ...x, servicio: d.servicio, servicioId: d.servicio.id })); }).catch(() => {});
    }
    const entered = !!(savedProfile && savedProfile.form && savedProfile.form.patName && (savedSession && (savedSession.code || savedSession.entered)));
    setPhase(entered ? "app" : "onboarding");
    refreshContent(mergedSession.servicioId || "");
    if (savedSession && savedSession.code) refreshProfile(savedSession.code);   // código explícito: el estado aún no se ha vuelto a renderizar
    else if (entered && loadJSON(KEYS.pending, false)) setTimeout(() => syncNow(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cuando cambia el servicio (QR, registro o recuperación), el contenido pasa a ser el de ese servicio
  const servicioIdRef = useRef(session.servicioId);
  useEffect(() => {
    if (phase === "boot" || session.servicioId === servicioIdRef.current) return;
    servicioIdRef.current = session.servicioId;
    refreshContent(session.servicioId || "");
  }, [session.servicioId, phase, refreshContent]);

  // ── Persistencia local ──
  useEffect(() => { if (phase !== "boot") saveJSON(KEYS.profile, { form, treeNodes, checklist, prefs }); }, [form, treeNodes, checklist, prefs, phase]);
  useEffect(() => { if (phase !== "boot") saveJSON(KEYS.session, { ...session, entered: phase === "app" }); }, [session, phase]);

  // ── Conexión ──
  useEffect(() => {
    const on = () => { setSync((s) => ({ ...s, online: true })); if (loadJSON(KEYS.pending, false)) syncNow(); };
    const off = () => setSync((s) => ({ ...s, online: false }));
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    const vis = () => { if (document.visibilityState === "visible" && Date.now() - lastRefreshRef.current > REFRESH_MS) { refreshProfile(); refreshContent(); } };
    document.addEventListener("visibilitychange", vis);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); document.removeEventListener("visibilitychange", vis); };
  }, [syncNow, refreshProfile, refreshContent]);

  // ── Acciones de alto nivel ──
  const createProfile = useCallback(async () => {
    await syncNow({ userInitiated: true });
  }, [syncNow]);

  const restoreWithCode = useCallback(async (code) => {
    setSync((s) => ({ ...s, busy: true }));
    try {
      const data = await callApi("getProfile", { code });
      applyRemoteProfile({ ...data, code: data.code || code });
      saveJSON(KEYS.pending, false);
      setSync((s) => ({ ...s, busy: false, pending: false, lastError: null }));
      lastRefreshRef.current = Date.now();
      setPhase("app");
      showToast("💙 Perfil recuperado");
    } catch (e) {
      setSync((s) => ({ ...s, busy: false }));
      showToast(e.code === "not_found" ? "⚠️ Código no encontrado" : e.code === "network" ? "📶 Sin conexión con el servidor" : `⚠️ ${e.message}`);
    }
  }, [applyRemoteProfile, showToast]);

  const saveProfile = useCallback(async (nextForm, nextPrefs, nextTree) => {
    if (nextForm) setForm(nextForm);
    if (nextPrefs) setPrefs(nextPrefs);
    if (nextTree) setTreeNodes(nextTree);
    const ok = await syncNow({ userInitiated: true, overrides: { ...(nextForm && { form: nextForm }), ...(nextPrefs && { prefs: nextPrefs }), ...(nextTree && { treeNodes: nextTree }) } });
    showToast(ok ? "✅ Cambios guardados" : mode === "local" ? "✅ Guardado en este dispositivo" : "💾 Guardado aquí; se subirá al reconectar");
  }, [syncNow, showToast, mode]);

  // ── Interacción con el equipo ──
  const withBackend = useCallback(async (fn) => {
    if (mode === "local") { showToast("📶 Esta función necesita conexión con el servidor"); return null; }
    const { session: s } = latest.current;
    if (!s.code) { showToast("⚠️ Tu perfil aún no está en el servidor"); return null; }
    try { return await fn(s.code); }
    catch (e) { showToast(e.code === "network" || e.code === "timeout" ? "📶 Sin conexión con el servidor" : `⚠️ ${e.message}`); return null; }
  }, [mode, showToast]);

  const respondRequest = useCallback(async (requestId, respuesta) => {
    const data = await withBackend((code) => callApi("respondRequest", { code, requestId, respuesta }));
    if (data) { setSession((s) => ({ ...s, solicitudes: data.solicitudes || s.solicitudes })); showToast(respuesta === "en_camino" ? "💙 El equipo sabrá que lo llevas" : "Avisamos al equipo"); }
  }, [withBackend, showToast]);

  const sendMessage = useCallback(async (texto) => {
    const data = await withBackend((code) => callApi("familySendMessage", { code, texto }));
    if (data) setSession((s) => ({ ...s, mensajes: data.mensajes || s.mensajes }));
    return !!data;
  }, [withBackend]);

  const readMessages = useCallback(async () => {
    const { session: s } = latest.current;
    if (!s.noLeidos) return;
    setSession((x) => ({ ...x, noLeidos: 0 }));
    if (mode !== "local" && s.code) callApi("familyReadMessages", { code: s.code }).catch(() => {});
  }, [mode]);

  const logout = useCallback(() => {
    clearAll();
    setForm(normalizeForm(EMPTY_FORM));
    setTreeNodes(normalizeTree(DEFAULT_TREE));
    setChecklist({});
    setPrefs({ darkMode: false, notifs: true });
    setSession(EMPTY_SESSION);
    setSync((s) => ({ ...s, pending: false, lastError: null }));
    setPhase("onboarding");
  }, []);

  if (phase === "boot") {
    return (<div className="boot-screen"><div className="boot-spinner" /><div>Cargando Puente UCI…</div></div>);
  }

  if (phase === "onboarding") {
    return (
      <Onboarding
        form={form} setForm={setForm} treeNodes={treeNodes} setTreeNodes={setTreeNodes}
        toast={toast} showToast={showToast} mode={mode} busy={sync.busy} session={session}
        onCreate={createProfile} onRestore={restoreWithCode}
        onEnter={(phone) => {
          // El WhatsApp se pide al final del registro: si lo dejó, se guarda y se sube con el perfil ya creado
          const f = { ...latest.current.form, famPhone: phone || "" };
          setForm(f);
          setPhase("app");
          if (phone) syncNow({ overrides: { form: f } });
        }}
      />
    );
  }

  return (
    <Shell
      form={form} treeNodes={treeNodes} checklist={checklist} setChecklist={setChecklist} prefs={prefs}
      session={session} content={content} sync={sync} mode={mode} toast={toast} showToast={showToast}
      onSaveProfile={saveProfile} onSyncNow={() => syncNow({ userInitiated: true })} onLogout={logout}
      onRespondRequest={respondRequest} onSendMessage={sendMessage} onReadMessages={readMessages} onRefresh={() => refreshProfile()}
    />
  );
}
