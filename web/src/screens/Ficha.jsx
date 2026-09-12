/** Ficha humanizada A4 horizontal para imprimir y pegar en la cabecera de la cama. */
import { splitHobbies, displayRole } from "../lib/profile.js";

function openPrintWindow(rootId, title) {
  const el = document.getElementById(rootId);
  if (!el) return;
  const w = window.open("", "_blank");
  if (!w) { window.print(); return; }
  // Copia los estilos de la app (en el prototipo la ventana salía sin formato).
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]')).map((n) => n.outerHTML).join("\n");
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title>${styles}<style>@page{size:A4 landscape;margin:0}body{margin:0;background:#fff}.print-preview-wrap{padding:0}</style></head><body>${el.innerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 900);
}

export default function Ficha({ form, treeNodes, patFirst, config, onBack }) {
  const nick = form.patNick || patFirst;
  const groups = splitHobbies(form);
  const devices = (form.helpDevices || []).filter((h) => !h.includes("No utiliza"));
  const familyList = treeNodes.filter((n) => n.id !== "pat" && n.label);
  const pat = treeNodes.find((n) => n.id === "pat");
  const livesWith = form.livesWith || [];
  const today = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });
  const Tags = ({ list, cls = "" }) => (list.length > 0
    ? <div className="poster-tags">{list.map((t) => <span key={t} className={`poster-tag ${cls}`}>{t}</span>)}</div>
    : <div className="poster-empty">No especificado</div>);

  return (
    <div className="screen print-screen">
      <div className="print-screen-header">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>🖨️ Ficha del Paciente</h1>
        <p>Vista previa de la ficha humanizada para imprimir y pegar en sala UCI</p>
      </div>
      <div className="print-note" style={{ margin: "20px 24px 0" }}>
        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>💡</span>
        <span>Esta ficha resume quién es <strong>{form.patName || "el paciente"}</strong> más allá de su diagnóstico. Imprímela en hoja A4 horizontal y pégala en la cabecera de su cama para que todo el equipo pueda conocerle como persona.</span>
      </div>
      <div className="print-preview-wrap" id="patient-poster-root">
        <div className="patient-poster">
          <div className="poster-top-bar">
            <div>
              <div className="poster-brand">💙 Puente <span>UCI</span></div>
              <div className="poster-tagline">Humanización del Cuidado Intensivo</div>
            </div>
            <div className="poster-uci-badge">📋 Ficha Humanizada · {today}</div>
          </div>
          <div className="poster-body">
            <div className="poster-left">
              <div className="poster-avatar-wrap" style={pat && pat.photo ? { overflow: "hidden", padding: 0 } : undefined}>
                {pat && pat.photo ? <img src={pat.photo} alt={form.patName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : (pat && pat.emoji) || "🙂"}
              </div>
              <div className="poster-pat-name">
                <h2>{form.patName || "Nombre del Paciente"}</h2>
                {nick !== patFirst && <div className="nickname">"{nick}"</div>}
              </div>
              <div className="poster-left-divider" />
              {form.patJob && (<div className="poster-meta-item"><div className="poster-meta-label">💼 Ocupación</div><div className="poster-meta-value">{form.patJob}</div></div>)}
              {form.education && (<div className="poster-meta-item"><div className="poster-meta-label">🎓 Educación</div><div className="poster-meta-value">{form.education}</div></div>)}
              {devices.length > 0 && (<><div className="poster-left-divider" /><div className="poster-devices"><div className="poster-devices-title">🦾 Ayudas técnicas</div><div className="poster-devices-grid">{devices.map((d) => <span key={d} className="poster-device-tag">{d}</span>)}</div></div></>)}
              {familyList.length > 0 && (
                <>
                  <div className="poster-left-divider" />
                  <div className="poster-devices" style={{ width: "100%" }}>
                    <div className="poster-devices-title">👨‍👩‍👧 Su familia</div>
                    <div className="poster-family-list">
                      {familyList.slice(0, 5).map((n) => (
                        <div key={n.id} className="poster-family-item">
                          {n.photo ? <img src={n.photo} alt={n.label} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} /> : <span className="poster-family-emoji">{n.emoji}</span>}
                          <span className="poster-family-name">{n.label}</span>
                          <span className="poster-family-role">· {displayRole(n)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="poster-right">
              <div className="poster-section">
                <div className="poster-section-title">🎵 Música que le gusta</div>
                {groups.music.length > 0 || form.musicExtra ? (
                  <div className="poster-tags">
                    {groups.music.map((t) => <span key={t} className="poster-tag">{t}</span>)}
                    {form.musicExtra && <span className="poster-tag teal">🎤 {form.musicExtra}</span>}
                  </div>
                ) : <div className="poster-empty">No especificado</div>}
              </div>
              <div className="poster-section"><div className="poster-section-title">🏃 Actividad física</div><Tags list={groups.sport} cls="green" /></div>
              <div className="poster-section"><div className="poster-section-title">🌿 Actividades cotidianas</div><Tags list={groups.daily} cls="purple" /></div>
              <div className="poster-section">
                <div className="poster-section-title">👥 Vida social y espiritual</div>
                {groups.social.length > 0 ? <Tags list={groups.social} cls="orange" /> : form.extra ? <div className="poster-tags"><span className="poster-tag orange">{form.extra}</span></div> : <div className="poster-empty">No especificado</div>}
                {form.extra && groups.social.length > 0 && (<div style={{ marginTop: 6 }} className="poster-tags"><span className="poster-tag orange">💬 {form.extra}</span></div>)}
              </div>
              <div className="poster-phrase-section">
                <div className="poster-phrase-icon">💙</div>
                <div className="poster-phrase-text">
                  <strong>Nuestro compromiso con {nick}</strong>
                  "Detrás de cada paciente hay una persona con una historia única. Conocerte nos permite cuidarte mejor. Estamos aquí para acompañarte en cada etapa de este camino."
                </div>
              </div>
            </div>
            <div className="poster-extra">
              <div className="poster-extra-section">
                <div className="poster-extra-title">🏠 Con quién vive</div>
                <Tags list={livesWith} />
              </div>
              <div className="poster-extra-section">
                <div className="poster-extra-title">📍 Dónde vive</div>
                {form.livesWhere ? <div style={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.5, marginBottom: 4 }}>{form.livesWhere}</div> : <div className="poster-empty" style={{ marginBottom: 4 }}>No especificado</div>}
                {form.zonaType && (
                  <span className={`poster-zona-badge ${form.zonaType === "Urbana" ? "zona-urbana" : "zona-rural"}`}>{form.zonaType === "Urbana" ? "🏙️" : "🌄"} Zona {form.zonaType}</span>
                )}
              </div>
              <div className="poster-extra-section" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="poster-extra-title">💬 La familia nos cuenta</div>
                {form.familyMessage ? (
                  <>
                    <div className="poster-message-text">"{form.familyMessage}"</div>
                    <div className="poster-message-lines" style={{ marginTop: "auto", paddingTop: 8 }}>{[...Array(3)].map((_, i) => <div key={i} className="poster-message-line" />)}</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: "0.6rem", color: "#94A3B8", marginBottom: 8, fontStyle: "italic" }}>Espacio libre para que la familia comparta algo especial sobre {nick}</div>
                    <div className="poster-message-lines">{[...Array(7)].map((_, i) => <div key={i} className="poster-message-line" />)}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="poster-bottom-bar">
            <div className="poster-bottom-left">Información proporcionada por la familia · Puente UCI · Humanización del Cuidado Intensivo</div>
            <div className="poster-bottom-right">🏥 {config.nombre_unidad}</div>
          </div>
        </div>
      </div>
      <div className="print-actions">
        <button className="print-btn-primary" onClick={() => window.print()}>🖨️ Imprimir ficha</button>
        <button className="print-btn-secondary" onClick={() => openPrintWindow("patient-poster-root", `Ficha ${form.patName}`)}>🗂️ Abrir en nueva ventana</button>
      </div>
      <div className="print-note">
        <span style={{ fontSize: "1rem", flexShrink: 0 }}>⚙️</span>
        <span>Para mejores resultados: imprime en <strong>A4 horizontal</strong>, activa <strong>"Más opciones → Ajustar al tamaño de página"</strong> en el diálogo de impresión, y desactiva los márgenes para que ocupe la hoja completa.</span>
      </div>
    </div>
  );
}
