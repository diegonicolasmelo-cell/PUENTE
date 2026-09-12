/**
 * Panel del equipo (modo demo): clave del servicio + nombre y rol → token por profesional.
 * Rutas por hash: #tablero · #paciente/<id> · #solicitudes · #mensajes · #qr · #perfil
 */
import { useState, useEffect, useCallback, useRef } from "react";
import "../styles/app.css";
import "./equipo.css";
import { getMode } from "../lib/api.js";
import { getStaffSession, setStaffSession, clearStaffSession, setAuthErrorHandler, staffCall, initials } from "./api.js";
import Login from "./views/Login.jsx";
import Tablero from "./views/Tablero.jsx";
import Paciente from "./views/Paciente.jsx";
import Solicitudes from "./views/Solicitudes.jsx";
import Mensajes from "./views/Mensajes.jsx";
import Qr from "./views/Qr.jsx";
import Perfil from "./views/Perfil.jsx";

const POLL_MS = 60 * 1000;
const TITLES = { tablero: "Tablero", paciente: "Paciente", solicitudes: "Solicitudes", mensajes: "Mensajes", qr: "QR del servicio", perfil: "Mi perfil" };

function parseHash() {
  const h = (window.location.hash || "#tablero").replace(/^#/, "");
  const [name, arg] = h.split("/");
  return { name: TITLES[name] ? name : "tablero", arg: arg ? decodeURIComponent(arg) : "" };
}

const I = {
  grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>,
  inbox: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"></path></svg>,
  msg: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  qr: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 21h1M21 14v1"></path></svg>,
  user: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  hospital: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M9 21v-5h6v5"></path><path d="M12 9v4M10 11h4"></path></svg>,
};

export default function EquipoApp() {
  const mode = getMode();
  const [session, setSession] = useState(() => getStaffSession());
  const [route, setRoute] = useState(parseHash);
  const [board, setBoard] = useState(null);
  const [boardError, setBoardError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800); }, []);
  const navigate = useCallback((hash) => { window.location.hash = hash; }, []);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    setAuthErrorHandler(() => { clearStaffSession(); setSession(null); setBoard(null); showToast("⚠️ Tu sesión expiró; vuelve a entrar"); });
  }, [showToast]);

  const loadBoard = useCallback(async () => {
    if (!getStaffSession()) return;
    try {
      const data = await staffCall("staffBoard");
      setBoard(data); setBoardError(null);
      if (data.profesional && data.servicio) setSession((s) => (s ? { ...s, profesional: data.profesional, servicio: data.servicio } : s));
    } catch (e) { setBoardError(e.message); }
  }, []);

  // Carga inicial + sondeo mientras la pestaña está visible
  useEffect(() => {
    if (!session) return;
    loadBoard();
    const t = setInterval(() => { if (document.visibilityState === "visible") loadBoard(); }, POLL_MS);
    const vis = () => { if (document.visibilityState === "visible") loadBoard(); };
    document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", vis); };
  }, [session && session.token, loadBoard]); // eslint-disable-line react-hooks/exhaustive-deps

  const login = (data) => { setStaffSession(data); setSession(data); navigate("tablero"); };
  const logout = () => { clearStaffSession(); setSession(null); setBoard(null); navigate("tablero"); };

  if (!session) return <Login mode={mode} onLogin={login} showToast={showToast} toast={toast} />;

  const pendientes = board ? board.pacientes.reduce((n, p) => n + (p.pendientes || 0), 0) : 0;
  const noLeidos = board ? board.pacientes.reduce((n, p) => n + (p.noLeidos || 0), 0) : 0;
  const prof = session.profesional || {};
  const serv = session.servicio || {};
  const NavBtn = ({ id, label, icon, badge, warm }) => (
    <button className={`eq-nav ${route.name === id ? "active" : ""}`} onClick={() => navigate(id)}>{icon}<span>{label}</span>{badge > 0 && <span className={`eq-badge${warm ? " warm" : ""}`}>{badge}</span>}</button>
  );
  const Tab = ({ id, label, icon, badge, warm }) => (
    <button className={`eq-tab ${route.name === id ? "active" : ""}`} onClick={() => navigate(id)}>{icon}{label}{badge > 0 && <span className={`eq-badge${warm ? " warm" : ""}`}>{badge}</span>}</button>
  );
  const title = route.name === "paciente" ? (board && (board.pacientes.concat(board.sinServicio).find((p) => p.id === route.arg) || {}).patName) || "Paciente" : `${TITLES[route.name]} · ${serv.nombre || ""}`;

  return (
    <div className="eq-root">
      <nav className="eq-side" aria-label="Navegación del panel">
        <div className="eq-brand">
          <div className="eq-brand-title">Puente <span>UCI</span></div>
          <div className="eq-brand-sub">Panel del equipo</div>
        </div>
        <div className="eq-service">
          <div className="eq-service-icon">{I.hospital}</div>
          <div><div className="eq-service-name">{serv.nombre}</div><div className="eq-service-sub">{serv.piso ? `Piso ${serv.piso} · ` : ""}{board ? `${board.pacientes.filter((p) => p.estado === "activo").length} activos` : "…"}</div></div>
        </div>
        <div className="eq-navlist">
          <div className="eq-navlbl">Servicio</div>
          <NavBtn id="tablero" label="Tablero" icon={I.grid} />
          <NavBtn id="solicitudes" label="Solicitudes" icon={I.inbox} badge={pendientes} warm />
          <NavBtn id="mensajes" label="Mensajes" icon={I.msg} badge={noLeidos} />
          <div className="eq-sep" />
          <div className="eq-navlbl">Familias</div>
          <NavBtn id="qr" label="QR del servicio" icon={I.qr} />
        </div>
        <div className="eq-foot">
          <div className="eq-user" role="button" tabIndex={0} onClick={() => navigate("perfil")} onKeyDown={(e) => { if (e.key === "Enter") navigate("perfil"); }}>
            <div className="eq-avatar">{initials(prof.nombre)}</div>
            <div><div className="eq-user-name">{prof.nombre}</div><div className="eq-user-role">{prof.rol}{prof.turno ? ` · turno ${prof.turno.toLowerCase()}` : ""}</div></div>
            <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--mint)" }}>Perfil</span>
          </div>
        </div>
      </nav>

      <div className="eq-main">
        <header className="eq-topbar">
          <div className="eq-topbar-title">
            {route.name === "paciente" && <button className="eq-btn ghost sm" style={{ borderColor: "transparent", color: "inherit", padding: "4px 6px" }} onClick={() => navigate("tablero")} aria-label="Volver al tablero">←</button>}
            <span>{title}</span>
          </div>
          <div className="eq-topbar-right">
            {route.name === "tablero" && <span className="eq-muted eq-no-print" style={{ fontSize: "0.75rem" }}>{board ? `Actualizado ${new Date(board.generadoEn).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })}` : ""}</span>}
            <div className="eq-avatar" role="button" tabIndex={0} onClick={() => navigate("perfil")} aria-label="Mi perfil">{initials(prof.nombre)}</div>
          </div>
        </header>

        <main className="eq-content">
          {route.name === "tablero" && <Tablero board={board} error={boardError} onReload={loadBoard} onOpen={(id) => navigate(`paciente/${id}`)} showToast={showToast} />}
          {route.name === "paciente" && <Paciente key={route.arg} patientId={route.arg} session={session} showToast={showToast} onChanged={loadBoard} onBack={() => navigate("tablero")} />}
          {route.name === "solicitudes" && <Solicitudes showToast={showToast} onOpen={(id) => navigate(`paciente/${id}`)} onChanged={loadBoard} />}
          {route.name === "mensajes" && <Mensajes onOpen={(id) => navigate(`paciente/${id}`)} />}
          {route.name === "qr" && <Qr session={session} showToast={showToast} />}
          {route.name === "perfil" && <Perfil session={session} onUpdate={(s) => { setStaffSession(s); setSession(s); }} onLogout={logout} showToast={showToast} />}
        </main>

        <nav className="eq-tabs" aria-label="Navegación">
          <Tab id="tablero" label="Tablero" icon={I.grid} />
          <Tab id="solicitudes" label="Solicitudes" icon={I.inbox} badge={pendientes} warm />
          <Tab id="mensajes" label="Mensajes" icon={I.msg} badge={noLeidos} />
          <Tab id="qr" label="QR" icon={I.qr} />
          <Tab id="perfil" label="Perfil" icon={I.user} />
        </nav>
      </div>

      {toast && <div className="eq-toast" role="status">{toast}</div>}
    </div>
  );
}
