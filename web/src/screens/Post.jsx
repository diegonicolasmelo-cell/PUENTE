import { POST_STEPS } from "../data/defaults.js";

export default function Post({ onBack }) {
  return (
    <div className="screen">
      <div className="screen-header" style={{ background: "linear-gradient(160deg,#064e3b,#059669)" }}>
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>¿Qué viene después?</h1>
        <p>Preparación para la vida post-UCI</p>
      </div>
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#ECFDF5", borderRadius: 16, padding: 16, border: "1px solid #A7F3D0" }}>
          <p style={{ fontSize: "0.875rem", color: "#065F46", lineHeight: 1.7 }}>🌱 <strong>¡Una buena noticia!</strong> Si tu familiar está acercándose al alta de la UCI, significa que su estado ha mejorado significativamente. El equipo ya está planificando los siguientes pasos.</p>
        </div>
        {POST_STEPS.map((s) => (
          <div key={s.n} style={{ background: "white", borderRadius: 16, padding: 18, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#059669", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Paso {s.n}</div>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0A1628", marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: "0.82rem", color: "#64748B", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
