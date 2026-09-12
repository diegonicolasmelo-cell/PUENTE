import { EOL_CARDS } from "../data/defaults.js";

export default function Eol({ onBack }) {
  return (
    <div className="screen">
      <div className="screen-header" style={{ background: "linear-gradient(160deg,#1a0533,#4a1060)" }}>
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>Cuidados de Fin de Vida</h1>
        <p>Acompañamiento con dignidad y respeto</p>
      </div>
      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#FFF8F0", borderRadius: 16, padding: 20, border: "1px solid #FDE8D0" }}>
          <div style={{ fontSize: "2rem", marginBottom: 10 }}>🕊️</div>
          <p style={{ fontSize: "0.875rem", color: "#64748B", lineHeight: 1.7 }}>Cuando el momento llega, nuestro equipo se enfoca en garantizar el bienestar, la dignidad y el acompañamiento de tu familiar y de toda la familia.</p>
        </div>
        {EOL_CARDS.map(({ icon, title, color, border, desc }) => (
          <div key={title} style={{ background: color, borderRadius: 16, padding: 20, border: `1px solid ${border}` }}>
            <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{icon}</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0A1628", marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748B", lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
        <div style={{ background: "rgba(0,180,216,0.08)", borderRadius: 16, padding: 16, border: "1px solid rgba(0,180,216,0.2)", marginTop: 4 }}>
          <p style={{ fontSize: "0.82rem", color: "#0077B6", lineHeight: 1.7, textAlign: "center" }}>💙 <em>"El cuidado no termina cuando la medicina llega a su límite. Comienza una nueva forma de cuidar."</em></p>
        </div>
      </div>
    </div>
  );
}
