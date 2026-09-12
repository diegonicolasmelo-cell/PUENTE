import { CHECKLIST_ITEMS } from "../data/defaults.js";

const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
const REQ_TAG = { pendiente: ["El equipo lo pidió", "tag-orange"], en_camino: ["En camino", "tag-blue"], no_puede: ["Pendiente", "tag-orange"], recibido: ["Recibido por el equipo", "tag-green"] };

export default function Info({ patFirst, config, checklist, setChecklist, solicitudes = [], onNavigate, onBack }) {
  const done = Object.values(checklist).filter(Boolean).length;
  const requestFor = (item) => solicitudes.find((r) => r.estado !== "cancelada" && (norm(r.texto) === norm(item) || norm(r.tipo) === norm(item)));
  return (
    <div className="screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>Información Útil</h1>
        <p>Todo lo que necesitas saber para acompañar a {patFirst}</p>
      </div>
      <div className="content-card">
        <div className="info-row">
          <div className="info-icon">🕐</div>
          <div className="info-content">
            <h4>Horario de visitas</h4>
            <div className="horario-badge">⏰ {config.horario_visitas}</div>
            <p>¿Necesitas horario especial? Consúltalo con el equipo de enfermería.</p>
          </div>
        </div>
        <div className="info-row">
          <div className="info-icon">🏥</div>
          <div className="info-content">
            <h4>{config.sala}</h4>
            <p>{config.sala_detalle}</p>
          </div>
        </div>
        <div className="info-row">
          <div className="info-icon">📞</div>
          <div className="info-content">
            <h4>Información médica</h4>
            <p>El médico tratante informa a las {config.hora_informe}. {config.informe_detalle}</p>
          </div>
        </div>
        {config.telefono_uci && (
          <div className="info-row">
            <div className="info-icon">☎️</div>
            <div className="info-content">
              <h4>Contacto UCI</h4>
              <p><a href={`tel:${config.telefono_uci.replace(/\s+/g, "")}`} style={{ color: "var(--teal)", fontWeight: 600 }}>{config.telefono_uci}</a> · Línea directa de enfermería</p>
            </div>
          </div>
        )}
      </div>
      <div className="section-title">
        <span>Lista de útiles de aseo</span>
        <a href="#useful" onClick={(e) => e.preventDefault()}>{done}/{CHECKLIST_ITEMS.length}</a>
      </div>
      <div className="content-card" style={{ marginTop: 0 }}>
        <ul className="checklist">
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item} role="checkbox" aria-checked={!!checklist[item]} tabIndex={0}
              onClick={() => setChecklist((c) => ({ ...c, [item]: !c[item] }))}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setChecklist((c) => ({ ...c, [item]: !c[item] })); } }}>
              <div className={`check-box ${checklist[item] ? "checked" : ""}`}>
                {checklist[item] && <span style={{ color: "var(--ocean)", fontSize: "0.8rem", fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ textDecoration: checklist[item] ? "line-through" : "none", color: checklist[item] ? "var(--slate)" : "var(--text)" }}>{item}</span>
              {requestFor(item) && <span className={`patient-tag ${REQ_TAG[requestFor(item).estado][1]}`} style={{ marginLeft: "auto" }}>{REQ_TAG[requestFor(item).estado][0]}</span>}
            </li>
          ))}
        </ul>
      </div>
      <div className="quick-tip" style={{ margin: "0 16px 16px" }}>
        <div className="tip-icon">💬</div>
        <div>
          <h4>Comunicación con el equipo</h4>
          <p>Puedes escribir consultas no urgentes al equipo desde la app. Para urgencias, usa el teléfono de contacto.</p>
          {onNavigate && <button className="tip-link" onClick={() => onNavigate("mensajes")}>Abrir mensajes →</button>}
        </div>
      </div>
    </div>
  );
}
