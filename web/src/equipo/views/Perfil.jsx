import { useState } from "react";
import { staffCall, ROLES, TURNOS, initials } from "../api.js";

export default function Perfil({ session, onUpdate, onLogout, showToast }) {
  const prof = session.profesional || {};
  const [nombre, setNombre] = useState(prof.nombre || "");
  const [rol, setRol] = useState(prof.rol || ROLES[0]);
  const [turno, setTurno] = useState(prof.turno || TURNOS[0]);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try { const r = await staffCall("staffUpdateMe", { nombre, rol, turno }); onUpdate({ ...session, profesional: r.profesional, servicio: r.servicio }); showToast("✅ Perfil actualizado"); }
    catch (e) { showToast(`⚠️ ${e.message}`); }
    finally { setBusy(false); }
  };
  return (
    <div className="eq-card" style={{ maxWidth: 560, overflow: "hidden" }}>
      <div style={{ background: "linear-gradient(160deg, var(--ocean), var(--deep))", padding: "24px 24px 28px", color: "white", display: "flex", alignItems: "center", gap: 16 }}>
        <div className="eq-avatar" style={{ width: 64, height: 64, fontSize: "1.3rem" }}>{initials(prof.nombre)}</div>
        <div><div className="eq-serif" style={{ fontSize: "1.5rem", lineHeight: 1.15 }}>{prof.nombre}</div><div style={{ fontSize: "0.82rem", color: "var(--foam)", marginTop: 4 }}>{prof.rol} · {session.servicio.nombre}{session.servicio.piso ? ` · Piso ${session.servicio.piso}` : ""}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, fontSize: "0.72rem", background: "rgba(0,180,216,0.18)", border: "1px solid rgba(0,180,216,0.35)", borderRadius: 999, padding: "4px 10px", color: "var(--mist)" }}>Acceso de prueba con clave del servicio</div>
        </div>
      </div>
      <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="eq-field"><label className="eq-label">Nombre</label><input className="eq-input" value={nombre} onChange={(e) => setNombre(e.target.value)} /></div>
        <div><label className="eq-label">Rol</label><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ROLES.map((r) => <button key={r} className={`eq-chip ${rol === r ? "sel" : ""}`} onClick={() => setRol(r)}>{r}</button>)}</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="eq-field"><label className="eq-label">Servicio</label><input className="eq-input" value={session.servicio.nombre} disabled /><div className="eq-muted" style={{ fontSize: "0.72rem", marginTop: 5 }}>Lo define la clave con la que entraste</div></div>
          <div className="eq-field"><label className="eq-label">Turno habitual</label><div className="eq-seg">{TURNOS.map((t) => <button key={t} className={turno === t ? "cur" : ""} onClick={() => setTurno(t)}>{t}</button>)}</div></div>
        </div>
        <div>
          <div className="eq-label">Lo que puedes hacer</div>
          {["Ver los pacientes de tu servicio y sus fichas humanizadas", "Pedir insumos y responder mensajes de las familias", "Cambiar la etapa, el estado y la cama que ve la familia", "Registrar pacientes y entregar códigos de acceso"].map((t) => <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.85rem", padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}><span style={{ color: "#059669", fontWeight: 700 }}>✓</span>{t}</div>)}
          <div className="eq-muted" style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "0.85rem", padding: "8px 0" }}><span>✕</span>Cambiar la clave del servicio o dar de baja profesionales: se hace en la planilla (hojas Servicios y Profesionales)</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="eq-btn primary" style={{ flex: 1 }} disabled={busy} onClick={save}>{busy ? "Guardando…" : "Guardar"}</button>
          <button className="eq-btn danger" onClick={() => { if (window.confirm("¿Cerrar sesión en este equipo?")) onLogout(); }}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
