import { useEffect, useState } from "react";
import { staffCall, when, initials } from "../api.js";

export default function Mensajes({ onOpen }) {
  const [hilos, setHilos] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => { staffCall("staffThreads").then((d) => setHilos(d.hilos)).catch((e) => setError(e.message)); }, []);
  if (error) return <div className="eq-empty">No se pudieron cargar los mensajes: {error}</div>;
  if (!hilos) return <div className="eq-empty">Cargando…</div>;
  return (
    <div className="eq-card" style={{ padding: "6px 20px" }}>
      {hilos.length === 0 && <div className="eq-empty">Todavía no hay conversaciones. Las familias escriben desde su app; también puedes iniciar una desde la ficha del paciente.</div>}
      {hilos.map((h) => (
        <div key={h.patientId} className="eq-row" role="button" tabIndex={0} style={{ cursor: "pointer", alignItems: "center" }} onClick={() => onOpen(h.patientId)} onKeyDown={(e) => { if (e.key === "Enter") onOpen(h.patientId); }}>
          <div className="eq-pavatar" style={{ width: 40, height: 40, fontSize: "0.8rem" }}>{initials(h.patName)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{h.patName}</span>{h.cama && <span className="eq-bed">CAMA {h.cama}</span>}{h.noLeidos > 0 && <span className="eq-badge warm">{h.noLeidos}</span>}</div>
            <div className="eq-muted" style={{ fontSize: "0.8rem", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.ultimo.origen === "familia" ? "Familia" : h.ultimo.autor.split(",")[0]}: {h.ultimo.texto}</div>
          </div>
          <span className="eq-muted" style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>{when(h.ultimo.creadoEn)}</span>
        </div>
      ))}
    </div>
  );
}
