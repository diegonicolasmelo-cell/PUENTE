import { useEffect, useState, useCallback } from "react";
import { staffCall, REQ_STATE, when } from "../api.js";

export default function Solicitudes({ showToast, onOpen, onChanged }) {
  const [list, setList] = useState(null);
  const [scope, setScope] = useState("abiertas");
  const load = useCallback(async () => { try { setList((await staffCall("staffRequests")).solicitudes); } catch (e) { showToast(`⚠️ ${e.message}`); } }, [showToast]);
  useEffect(() => { load(); }, [load]);
  if (!list) return <div className="eq-empty">Cargando solicitudes…</div>;
  const open = (r) => r.estado !== "recibido" && r.estado !== "cancelada";
  const shown = list.filter((r) => scope === "abiertas" ? open(r) : true);
  const update = async (id, estado) => { try { await staffCall("staffUpdateRequest", { requestId: id, estado }); await load(); onChanged && onChanged(); } catch (e) { showToast(`⚠️ ${e.message}`); } };
  return (
    <>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button className={`eq-pill ${scope === "abiertas" ? "on" : "off"}`} onClick={() => setScope("abiertas")}>Abiertas · {list.filter(open).length}</button>
        <button className={`eq-pill ${scope === "todas" ? "on" : "off"}`} onClick={() => setScope("todas")}>Todas · {list.length}</button>
      </div>
      <div className="eq-card" style={{ padding: "6px 20px" }}>
        {shown.length === 0 && <div className="eq-empty">No hay solicitudes {scope === "abiertas" ? "abiertas" : ""}. Se crean desde la ficha de cada paciente.</div>}
        {shown.map((r) => { const [label, color] = REQ_STATE[r.estado] || REQ_STATE.pendiente; return (
          <div key={r.id} className="eq-row" style={{ alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0, fontSize: "0.85rem", lineHeight: 1.45 }}>
              <span style={{ fontWeight: 600 }}>{r.texto}</span>{r.prioridad === "urgente" && <span className="eq-tag red" style={{ marginLeft: 8 }}>Urgente</span>}{r.nota && <span className="eq-muted"> · {r.nota}</span>}
              <div className="eq-muted" style={{ fontSize: "0.75rem" }}>
                <button className="eq-btn ghost sm" style={{ padding: "0 4px", border: "none", color: "var(--teal)", fontWeight: 600 }} onClick={() => onOpen(r.patientId)}>{r.patName || "Paciente"}{r.cama ? ` · cama ${r.cama}` : ""}</button>
                · {r.estado === "recibido" ? `recibido ${when(r.recibidoEn)}` : r.respondidoEn ? `la familia respondió "${r.respuesta}" ${when(r.respondidoEn)}` : `enviado ${when(r.creadoEn)} por ${r.creadoPor}`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <span className={`eq-tag ${color}`}>{label}</span>
              {open(r) && <button className="eq-btn outline sm" onClick={() => update(r.id, "recibido")}>Recibido</button>}
              {r.estado === "pendiente" && <button className="eq-btn ghost sm" onClick={() => update(r.id, "cancelada")}>Cancelar</button>}
            </div>
          </div>
        ); })}
      </div>
    </>
  );
}
