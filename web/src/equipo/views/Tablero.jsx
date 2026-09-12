import { useState } from "react";
import { staffCall, ETAPAS, ago, initials } from "../api.js";
import { useRegisterModal } from "./RegisterModal.jsx";

const FILTERS = [
  { id: "todos", label: "Todos", test: () => true },
  { id: "pendientes", label: "Con solicitudes pendientes", test: (p) => p.pendientes > 0 },
  { id: "mensajes", label: "Mensajes sin responder", test: (p) => p.noLeidos > 0 },
  { id: "incompleto", label: "Perfil incompleto", test: (p) => p.incompleto },
  { id: "sinfamiliar", label: "Sin familiar conectado", test: (p) => p.sinFamiliar },
];

function Stage({ etapa }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} style={{ display: "contents" }}>
          <div className={`eq-dot ${n < etapa ? "done" : n === etapa ? "cur" : "fut"}`}>{n < etapa ? "✓" : n}</div>
          {n < 4 && <div className={`eq-con ${n < etapa ? "done" : ""}`} />}
        </span>
      ))}
      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--teal)", marginLeft: 6 }}>{ETAPAS[etapa - 1]}</span>
    </div>
  );
}

export function PatientCard({ p, onOpen, extra }) {
  const attention = p.pendientes > 0 || p.noLeidos > 0;
  return (
    <div className={`eq-card eq-pcard ${attention ? "attention" : ""} ${p.sinFamiliar ? "dashed" : ""}`} role="button" tabIndex={0} onClick={() => onOpen(p.id)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(p.id); }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="eq-pavatar" style={p.sinFamiliar ? { background: "#E2E8F0", color: "var(--slate)" } : undefined}>{initials(p.patName)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.patName || "Sin nombre"}</div>
          <div className="eq-muted" style={{ fontSize: "0.75rem", marginTop: 2 }}>{p.patNick ? `"${p.patNick}"` : ""}{p.patNick && p.patJob ? " · " : ""}{p.patJob || (p.sinFamiliar ? "Sin perfil todavía" : "")}</div>
        </div>
        {p.cama ? <span className="eq-bed">CAMA {p.cama}</span> : <span className="eq-tag grey">sin cama</span>}
      </div>
      {p.sinFamiliar ? (
        <>
          <div className="eq-muted" style={{ fontSize: "0.78rem", lineHeight: 1.5 }}>Ningún familiar ha entrado con el código. Entrégalo en la próxima visita.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="eq-serif" style={{ fontSize: "1.05rem", letterSpacing: "0.12em", color: "var(--deep)" }}>{p.code}</span>
            <button className="eq-btn outline sm" style={{ marginLeft: "auto" }} onClick={(e) => { e.stopPropagation(); navigator.clipboard && navigator.clipboard.writeText(p.code); }}>Copiar código</button>
          </div>
        </>
      ) : (
        <>
          <Stage etapa={p.etapa} />
          <div className="eq-muted" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.famName}{p.famPhone ? ` · ${p.famPhone}` : " · sin WhatsApp"}</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {p.estado !== "activo" && <span className="eq-tag purple">{p.estado === "alta" ? "Alta de UCI" : p.estado === "fallecido" ? "Fallecido/a" : p.estado}</span>}
            {p.pendientes > 0 && <span className="eq-tag orange">{p.pendientes} solicitud{p.pendientes > 1 ? "es" : ""} pendiente{p.pendientes > 1 ? "s" : ""}</span>}
            {p.noLeidos > 0 && <span className="eq-tag blue">{p.noLeidos} mensaje{p.noLeidos > 1 ? "s" : ""} sin responder</span>}
            {p.incompleto && <span className="eq-tag orange">Perfil incompleto</span>}
            <span className={`eq-tag ${p.utiles.done === p.utiles.total ? "green" : "grey"}`}>Útiles {p.utiles.done}/{p.utiles.total}</span>
            <span className="eq-tag grey">Familia activa {ago(p.updatedAt)}</span>
          </div>
        </>
      )}
      {extra}
    </div>
  );
}

export default function Tablero({ board, error, onReload, onOpen, showToast }) {
  const [filter, setFilter] = useState("todos");
  const [q, setQ] = useState("");
  const { modal, open: openRegister } = useRegisterModal({ showToast, onDone: onReload });

  if (!board) return <div className="eq-empty">{error ? `No se pudo cargar el tablero: ${error}` : "Cargando el tablero…"}{error && <div style={{ marginTop: 12 }}><button className="eq-btn outline sm" onClick={onReload}>Reintentar</button></div>}</div>;

  const norm = (t) => String(t || "").toLowerCase();
  const test = FILTERS.find((f) => f.id === filter).test;
  const list = board.pacientes.filter(test).filter((p) => !q || norm(p.patName).includes(norm(q)) || norm(p.patNick).includes(norm(q)) || norm(p.cama) === norm(q) || norm(p.famName).includes(norm(q)));
  const count = (f) => board.pacientes.filter(f.test).length;
  const pendientes = board.pacientes.filter((p) => p.pendientes > 0);

  const assign = async (p) => {
    try { await staffCall("staffUpdatePatient", { patientId: p.id, asignar: true }); showToast(`✅ ${p.patName} ahora está en ${board.servicio.nombre}`); onReload(); }
    catch (e) { showToast(`⚠️ ${e.message}`); }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {FILTERS.map((f) => <button key={f.id} className={`eq-pill ${filter === f.id ? "on" : "off"}`} onClick={() => setFilter(f.id)}>{f.label} · {count(f)}</button>)}
        <input className="eq-input" style={{ width: 240, marginLeft: "auto" }} placeholder="Buscar por nombre, cama o familiar" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="eq-btn primary" onClick={openRegister}>+ Registrar paciente</button>
      </div>

      <div className="eq-two wide">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {list.length === 0 && <div className="eq-card eq-empty">No hay pacientes en este filtro.{board.pacientes.length === 0 && <><br />Cuando una familia entre con el QR del servicio, aparecerá aquí.</>}</div>}
          <div className="eq-grid">
            {list.map((p) => <PatientCard key={p.id} p={p} onOpen={onOpen} />)}
          </div>
          {board.sinServicio.length > 0 && (
            <div className="eq-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="eq-h">Perfiles sin servicio asignado</div>
              <div className="eq-muted" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>Familias que se registraron sin el QR del servicio. Si el paciente está en tu unidad, asígnalo para verlo en el tablero.</div>
              <div className="eq-grid">
                {board.sinServicio.map((p) => (
                  <PatientCard key={p.id} p={p} onOpen={onOpen} extra={<button className="eq-btn outline sm" onClick={(e) => { e.stopPropagation(); assign(p); }}>Asignar a {board.servicio.nombre}</button>} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="eq-card" style={{ padding: "18px 20px 8px" }}>
            <div className="eq-h" style={{ marginBottom: 4 }}>Con solicitudes pendientes</div>
            {pendientes.length === 0 && <div className="eq-muted" style={{ fontSize: "0.8rem", padding: "10px 0 14px" }}>Nada pendiente. Desde la ficha de cada paciente puedes pedir insumos a la familia.</div>}
            {pendientes.map((p) => (
              <div key={p.id} className="eq-row" role="button" tabIndex={0} style={{ cursor: "pointer" }} onClick={() => onOpen(p.id)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(p.id); }}>
                <div className="eq-icon-box" style={{ background: "#FFF7ED", color: "#C2410C" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></div>
                <div style={{ fontSize: "0.82rem", lineHeight: 1.45 }}><span style={{ fontWeight: 600 }}>{p.patName}</span>{p.cama ? ` · cama ${p.cama}` : ""}<div className="eq-muted" style={{ fontSize: "0.75rem" }}>{p.pendientes} pendiente{p.pendientes > 1 ? "s" : ""} · familia activa {ago(p.updatedAt)}</div></div>
              </div>
            ))}
          </div>
          <div className="eq-card" style={{ padding: "18px 20px" }}>
            <div className="eq-h" style={{ marginBottom: 8 }}>Resumen del servicio</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Activos", board.pacientes.filter((p) => p.estado === "activo").length], ["Solicitudes pendientes", board.pacientes.reduce((n, p) => n + p.pendientes, 0)], ["Mensajes sin responder", board.pacientes.reduce((n, p) => n + p.noLeidos, 0)], ["Perfiles incompletos", board.pacientes.filter((p) => p.incompleto).length]].map(([l, v]) => (
                <div key={l} style={{ background: "#F8FAFC", borderRadius: 12, padding: "10px 12px" }}><div className="eq-serif" style={{ fontSize: "1.4rem", color: "var(--deep)" }}>{v}</div><div className="eq-muted" style={{ fontSize: "0.72rem" }}>{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {modal}
    </>
  );
}
