import { useState } from "react";
import { callApi } from "../../lib/api.js";
import { KEYS, saveJSON, getString } from "../../lib/storage.js";
import { ROLES, TURNOS } from "../api.js";

export default function Login({ mode, onLogin, showToast, toast }) {
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [rol, setRol] = useState(ROLES[0]);
  const [turno, setTurno] = useState(TURNOS[0]);
  const [apiUrl, setApiUrl] = useState(() => getString(KEYS.apiUrl));
  const [busy, setBusy] = useState(false);

  const saveApiUrl = () => {
    const u = apiUrl.trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(u)) { showToast("⚠️ Pega la URL que termina en /exec"); return; }
    try { localStorage.setItem(KEYS.apiUrl, u); } catch (_) {}
    window.location.reload();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!clave.trim() || !nombre.trim()) { showToast("⚠️ Completa la clave y tu nombre"); return; }
    setBusy(true);
    try {
      const data = await callApi("staffLogin", { clave: clave.trim(), nombre: nombre.trim(), rol, turno });
      onLogin(data);
    } catch (err) {
      showToast(err.code === "auth" ? "⚠️ Clave de servicio incorrecta" : err.code === "network" ? "📶 Sin conexión con el servidor" : `⚠️ ${err.message}`);
    } finally { setBusy(false); }
  };

  return (
    <div className="eq-login">
      <form className="eq-login-card" onSubmit={submit}>
        <div>
          <div className="eq-brand-title">Puente <span>UCI</span></div>
          <div className="eq-brand-sub">Panel del equipo · acceso de prueba</div>
        </div>
        {mode === "local" ? (
          <>
            <p>El panel necesita la dirección del servidor (la implementación de Apps Script). Pégala una vez en este equipo.</p>
            <div className="eq-field"><label className="eq-label">URL del servidor</label><input className="eq-input" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://script.google.com/macros/s/…/exec" /></div>
            <button type="button" className="eq-btn primary" onClick={saveApiUrl}>Guardar y continuar</button>
          </>
        ) : (
          <>
            <p>Entra con la clave de acceso de tu servicio y tu nombre. Lo que hagas queda registrado con tu nombre.</p>
            <div className="eq-field"><label className="eq-label" htmlFor="lg-clave">Clave del servicio</label><input id="lg-clave" className="eq-input" autoCapitalize="characters" autoComplete="off" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Ej: DEMO-2026" /></div>
            <div className="eq-field"><label className="eq-label" htmlFor="lg-nombre">Tu nombre</label><input id="lg-nombre" className="eq-input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Claudia Rojas" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div className="eq-field"><label className="eq-label" htmlFor="lg-rol">Rol</label><select id="lg-rol" className="eq-select" value={rol} onChange={(e) => setRol(e.target.value)}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
              <div className="eq-field"><label className="eq-label" htmlFor="lg-turno">Turno</label><select id="lg-turno" className="eq-select" value={turno} onChange={(e) => setTurno(e.target.value)}>{TURNOS.map((t) => <option key={t}>{t}</option>)}</select></div>
            </div>
            <button type="submit" className="eq-btn primary" disabled={busy} style={{ marginTop: 4 }}>{busy ? "Entrando…" : "Entrar al panel"}</button>
            <p style={{ fontSize: "0.75rem" }}>Modo de prueba: la clave la define el administrador en la hoja Servicios de la planilla. Más adelante el acceso será con cuenta institucional.</p>
          </>
        )}
      </form>
      <a className="eq-back-link" href={import.meta.env.BASE_URL}>← Soy familiar: ir a la app</a>
      {toast && <div className="eq-toast" role="status">{toast}</div>}
    </div>
  );
}
