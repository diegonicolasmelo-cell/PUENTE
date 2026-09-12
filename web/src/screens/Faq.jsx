import { useState } from "react";

export default function Faq({ faq, onBack }) {
  const cats = Object.keys(faq);
  const [activeCat, setActiveCat] = useState(cats[0] || "");
  const [open, setOpen] = useState(null);
  const items = faq[activeCat] || faq[cats[0]] || [];
  return (
    <div className="screen faq-screen">
      <div className="faq-header">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>Preguntas Frecuentes</h1>
        <p>Respuestas claras a las dudas más comunes</p>
      </div>
      <div className="faq-categories" role="tablist">
        {cats.map((cat) => (
          <button key={cat} role="tab" aria-selected={activeCat === cat} className={`cat-pill ${activeCat === cat ? "active" : ""}`} onClick={() => { setActiveCat(cat); setOpen(null); }}>{cat}</button>
        ))}
      </div>
      <div className="faq-list">
        {items.map((item, i) => (
          <div key={item.q} className="faq-item fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="faq-question" role="button" tabIndex={0} aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(open === i ? null : i); } }}>
              <span className="faq-q-text">{item.tag && <span style={{ marginRight: 7 }}>{item.tag}</span>}{item.q}</span>
              <span className={`faq-chevron ${open === i ? "open" : ""}`}>▼</span>
            </div>
            {open === i && (
              <div className="faq-answer">
                <div className="faq-answer-inner">
                  {String(item.a).split(/\n\n|\\n\\n/).map((para, pi, arr) => (
                    <p key={pi} style={{ marginBottom: pi < arr.length - 1 ? "10px" : 0 }}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
