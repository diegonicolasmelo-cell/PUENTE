import { STAGE_SHORT } from "../data/defaults.js";
import { normalizeStage, ESTADO_LABEL } from "../lib/journey.js";

const MENU = [
  { cls: "card-info",    icon: "ℹ️", title: "Información de Utilidad", desc: "Horarios, útiles y trámites", tab: "info" },
  { cls: "card-journey", icon: "🗺️", title: "El Viaje de la UCI",      desc: "Entiende cada etapa del proceso", tab: "journey" },
  { cls: "card-video",   icon: "▶️", title: "Videos Informativos",     desc: "Cápsulas educativas en video", tab: "videos" },
  { cls: "card-faq",     icon: "❓", title: "Preguntas Frecuentes",    desc: "Respuestas a tus dudas comunes", tab: "faq" },
  { cls: "card-eol",     icon: "🕊️", title: "Cuidados de Fin de Vida", desc: "Acompañamiento y apoyo", tab: "eol" },
  { cls: "card-post",    icon: "🏠", title: "¿Qué viene después?",     desc: "Preparación para el alta", tab: "post" },
  { cls: "card-print",   icon: "🖨️", title: "Ficha del Paciente",      desc: "Imprimir para pegar en sala UCI", tab: "ficha" },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches";
}

const REQ_LABEL = { pendiente: "Pendiente", en_camino: "En camino", no_puede: "Avisaste que no puedes", recibido: "Recibido por el equipo" };

function whenLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso); if (isNaN(d)) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay ? `hoy ${d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false })}` : d.toLocaleDateString("es-CL", { day: "numeric", month: "long" });
}

export default function Home({ form, etapa, estado, cama, config, firstName, missing, solicitudes = [], mensajes = [], noLeidos = 0, mode, onRespondRequest, onNavigate, onOpenSidebar }) {
  const cur = normalizeStage(etapa);
  const abiertas = solicitudes.filter((r) => r.estado !== "recibido" && r.estado !== "cancelada");
  const recibidas = solicitudes.filter((r) => r.estado === "recibido").slice(0, 2);
  const lastTeamMsg = [...mensajes].reverse().find((m) => m.origen === "equipo");
  const estadoLabel = ESTADO_LABEL[estado] || ESTADO_LABEL.activo;
  const activo = !estado || estado === "activo";
  return (
    <div className="screen">
      <div className="home-hero">
        <div className="hero-bg-circle" style={{ width: 200, height: 200, background: "rgba(0,180,216,0.08)", top: -60, right: -60, borderRadius: "50%" }} />
        <div className="hero-bg-circle" style={{ width: 120, height: 120, background: "rgba(0,180,216,0.06)", bottom: -20, left: 20, borderRadius: "50%" }} />
        <p className="hero-greeting fade-up">{greeting()}, {firstName} 👋</p>
        <h1 className="hero-name fade-up delay-1">¿Cómo estás hoy?</h1>
        <p className="hero-sub fade-up delay-2">Estamos aquí para acompañarte</p>
      </div>
      <div className="status-card fade-up delay-2">
        <div className="status-label">Estado de tu familiar</div>
        <div className="status-row">
          <div className={`status-dot ${activo ? "active" : ""}`} />
          <div className="status-info">
            <h3>{form.patName || "Paciente"}</h3>
            <p>{form.patNick ? `"${form.patNick}" · ` : ""}{cama ? `Cama ${cama} · ` : ""}{config.nombre_unidad}</p>
          </div>
          <span className="status-badge badge-uci">{estadoLabel}</span>
        </div>
        <div className="journey-mini" aria-label={`Etapa actual: ${STAGE_SHORT[cur - 1]}`}>
          {STAGE_SHORT.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div className="journey-stage">
                <div className={`j-dot ${i + 1 < cur ? "done" : i + 1 === cur ? "current" : "future"}`}>{i + 1 < cur ? "✓" : i + 1}</div>
                <div className="j-label">{s}</div>
              </div>
              {i < 3 && <div className={`j-connector ${i + 1 < cur ? "done" : ""}`} />}
            </div>
          ))}
        </div>
      </div>

      {(abiertas.length > 0 || recibidas.length > 0) && (
        <>
          <div className="section-title fade-up delay-3"><span>Avisos del equipo</span>{abiertas.filter((r) => r.estado === "pendiente").length > 0 && <span className="badge-count warm">{abiertas.filter((r) => r.estado === "pendiente").length} nuevo{abiertas.filter((r) => r.estado === "pendiente").length > 1 ? "s" : ""}</span>}</div>
          <div className="aviso-list fade-up delay-3">
            {abiertas.map((r) => (
              <div key={r.id} className={`aviso-card ${r.estado}`}>
                <div className="aviso-head">
                  <div className={`aviso-icon ${r.estado}`} aria-hidden="true">{r.estado === "pendiente" ? "🔔" : r.estado === "en_camino" ? "➡️" : "⏸️"}</div>
                  <div className="aviso-body">
                    <h4>El equipo pide: {r.texto}{r.prioridad === "urgente" && <span className="tag-urgente">Urgente</span>}</h4>
                    <p>{r.creadoPor} · {whenLabel(r.creadoEn)}</p>
                    {r.nota && <div className="aviso-nota">{r.nota}</div>}
                  </div>
                </div>
                {r.estado === "pendiente" ? (
                  <div className="aviso-actions">
                    <button className="aviso-btn primary" onClick={() => onRespondRequest(r.id, "en_camino")}>Ya lo llevo</button>
                    <button className="aviso-btn" onClick={() => onRespondRequest(r.id, "no_puede")}>No puedo hoy</button>
                  </div>
                ) : (
                  <div className="aviso-actions">
                    <span className={`aviso-state ${r.estado}`}>{REQ_LABEL[r.estado]}{r.respondidoEn ? ` · ${whenLabel(r.respondidoEn)}` : ""}</span>
                    {r.estado === "no_puede" && <button className="aviso-btn small" onClick={() => onRespondRequest(r.id, "en_camino")}>Ya puedo llevarlo</button>}
                  </div>
                )}
              </div>
            ))}
            {recibidas.map((r) => (
              <div key={r.id} className="aviso-card recibido">
                <div className="aviso-head">
                  <div className="aviso-icon recibido" aria-hidden="true">✓</div>
                  <div className="aviso-body"><h4>{r.texto}</h4><p>Recibido por el equipo · {whenLabel(r.recibidoEn)}</p></div>
                  <span className="aviso-state recibido">Recibido</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {mode !== "local" && (
        <div className="msg-entry fade-up delay-3" role="button" tabIndex={0} onClick={() => onNavigate("mensajes")} onKeyDown={(e) => { if (e.key === "Enter") onNavigate("mensajes"); }}>
          <div className="msg-entry-icon" aria-hidden="true">💬</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4>Mensajes con el equipo {noLeidos > 0 && <span className="badge-count warm">{noLeidos}</span>}</h4>
            <p>{lastTeamMsg ? `${lastTeamMsg.autor.split(",")[0]}: "${lastTeamMsg.texto.slice(0, 70)}${lastTeamMsg.texto.length > 70 ? "…" : ""}"` : "Escribe tus consultas no urgentes al equipo de la UCI"}</p>
          </div>
          <div className="menu-arrow">Abrir →</div>
        </div>
      )}

      {missing.length > 0 && (
        <div className="nudge-card fade-up delay-3" role="button" tabIndex={0} onClick={onOpenSidebar} onKeyDown={(e) => { if (e.key === "Enter") onOpenSidebar(); }}>
          <div className="nudge-icon">📝</div>
          <div>
            <h4>Completa el perfil de {form.patNick || form.patName.split(" ")[0] || "tu familiar"}</h4>
            <p>Falta: {missing.join(", ")}. Así la ficha impresa sale completa.</p>
          </div>
          <div className="menu-arrow">Completar →</div>
        </div>
      )}

      <div className="quick-tip fade-up delay-3">
        <div className="tip-icon">💡</div>
        <div>
          <h4>Consejo del día</h4>
          <p>{config.consejo_dia}</p>
        </div>
      </div>
      <div className="section-title fade-up delay-3"><span>¿Qué necesitas?</span></div>
      <div className="menu-grid fade-up delay-4">
        {MENU.map((m) => (
          <div key={m.tab} className={`menu-card ${m.cls}`} role="button" tabIndex={0} onClick={() => onNavigate(m.tab)} onKeyDown={(e) => { if (e.key === "Enter") onNavigate(m.tab); }}>
            <div className="menu-icon">{m.icon}</div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <div className="menu-arrow">Ver más →</div>
          </div>
        ))}
      </div>
    </div>
  );
}
