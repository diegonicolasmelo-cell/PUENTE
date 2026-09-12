import { stagesWithState } from "../lib/journey.js";

export default function Journey({ etapa, steps, onOpenStep, onBack }) {
  const list = stagesWithState(etapa, steps);
  return (
    <div className="screen journey-screen">
      <div className="journey-intro">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>El Viaje de la UCI</h1>
        <p>Cada persona recorre la UCI a su ritmo. Algunos avanzan rápido, otros se detienen o retroceden. Todos los caminos son válidos.</p>
      </div>
      <div className="journey-map">
        {list.map((step, i) => (
          <div key={step.id} className={`journey-step step-${step.state}`} role="button" tabIndex={0} onClick={() => onOpenStep(step)} onKeyDown={(e) => { if (e.key === "Enter") onOpenStep(step); }}>
            <div className="step-track">
              <div className="step-circle">{step.state === "done" ? "✓" : i + 1}</div>
              {i < list.length - 1 && <div className="step-line" />}
            </div>
            <div className="step-body">
              <h3>{step.label} {step.state === "current" && <span style={{ fontSize: "0.7rem", background: "var(--teal)", color: "white", padding: "2px 8px", borderRadius: 10, marginLeft: 6 }}>Hoy</span>}</h3>
              <p>{step.state === "current" ? "Aquí estamos hoy" : step.sub}</p>
            </div>
            <div style={{ paddingTop: 8, color: "var(--slate)", fontSize: "0.75rem" }}>›</div>
          </div>
        ))}
      </div>
      <div className="journey-note">
        <span>⚠️</span>
        <span>El proceso puede tener avances y retrocesos. El equipo te acompañará y te informará en cada momento del camino.</span>
      </div>
    </div>
  );
}
