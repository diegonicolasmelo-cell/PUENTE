/**
 * Panel lateral "Editar perfil". Trabaja sobre un borrador y aplica al guardar (como el prototipo).
 * Usa el catálogo único de chips para que las selecciones del onboarding aparezcan marcadas.
 */
import { useState } from "react";
import { CATALOG, CUSTOM_PREFIX } from "../data/defaults.js";

const CHIP_SECTIONS = [
  { key: "music",  title: "🎵 Música",                    placeholder: "Ej: Jazz, Cueca, Trap..." },
  { key: "sport",  title: "🏃 Actividad física",          placeholder: "Ej: Tenis, Golf, Boxeo..." },
  { key: "daily",  title: "🌿 Actividades cotidianas",    placeholder: "Ej: Pintura, Ajedrez, Fotografía..." },
  { key: "social", title: "👥 Vida social y espiritual",  placeholder: "Ej: Club de adultos mayores, Coro..." },
];

export default function ProfileSidebar({ form, prefs, patNick, saving, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...form });
  const [draftPrefs, setDraftPrefs] = useState({ ...prefs });
  const [customInputs, setCustomInputs] = useState({ music: "", sport: "", daily: "", social: "" });

  const set = (key, val) => setDraft((d) => ({ ...d, [key]: val }));
  const toggleIn = (key, val) => setDraft((d) => {
    const cur = d[key] || [];
    return { ...d, [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
  });
  const addCustomTag = (cat) => {
    const val = (customInputs[cat] || "").trim();
    if (!val) return;
    const tagged = CUSTOM_PREFIX[cat] + val;
    setDraft((d) => (d.hobbies.includes(tagged) ? d : { ...d, hobbies: [...d.hobbies, tagged] }));
    setCustomInputs((c) => ({ ...c, [cat]: "" }));
  };
  const removeTag = (val) => setDraft((d) => ({ ...d, hobbies: d.hobbies.filter((h) => h !== val) }));

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />
      <aside className="sidebar" aria-label="Editar perfil">
        <div className="sidebar-head">
          <button className="sidebar-close" aria-label="Cerrar" onClick={onClose}>✕</button>
          <h2>Editar perfil</h2>
          <p>Los cambios se aplican al guardar</p>
        </div>
        <div className="sidebar-body">
          <div className="sidebar-section">
            <div className="sidebar-section-title">👤 Mis datos (familiar)</div>
            <div className="sidebar-field"><label>Nombre</label><input value={draft.famName} onChange={(e) => set("famName", e.target.value)} placeholder="Tu nombre completo" /></div>
            <div className="sidebar-field"><label>WhatsApp</label><input inputMode="tel" value={draft.famPhone} onChange={(e) => set("famPhone", e.target.value)} placeholder="+56 9 1234 5678" /></div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">🧑 Datos del paciente</div>
            <div className="sidebar-field"><label>Nombre completo</label><input value={draft.patName} onChange={(e) => set("patName", e.target.value)} placeholder="Nombre del paciente" /></div>
            <div className="sidebar-field"><label>¿Cómo le llaman?</label><input value={draft.patNick} onChange={(e) => set("patNick", e.target.value)} placeholder="Apodo o nombre preferido" /></div>
            <div className="sidebar-field"><label>Ocupación</label><input value={draft.patJob} onChange={(e) => set("patJob", e.target.value)} placeholder="Profesión u oficio" /></div>
            <div className="sidebar-field"><label>Nivel educacional</label>
              <select value={draft.education} onChange={(e) => set("education", e.target.value)}>
                <option value="">Selecciona...</option>
                {CATALOG.education.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {CHIP_SECTIONS.map(({ key, title, placeholder }) => (
            <div className="sidebar-section" key={key}>
              <div className="sidebar-section-title">{title}</div>
              <div className="sidebar-chip-grid">
                {CATALOG[key].map((h) => (
                  <button type="button" key={h} className={`sidebar-chip${draft.hobbies.includes(h) ? " sel" : ""}`} aria-pressed={draft.hobbies.includes(h)} onClick={() => toggleIn("hobbies", h)}>{h}</button>
                ))}
                {draft.hobbies.filter((h) => h.startsWith(CUSTOM_PREFIX[key])).map((h) => (
                  <button type="button" key={h} className="sidebar-chip sel custom" onClick={() => removeTag(h)}>
                    {h.slice(CUSTOM_PREFIX[key].length)} <span className="chip-remove" aria-hidden="true">✕</span>
                  </button>
                ))}
              </div>
              <div className="custom-tag-row">
                <input className="custom-tag-input" placeholder={placeholder} value={customInputs[key]}
                  onChange={(e) => setCustomInputs((c) => ({ ...c, [key]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(key); } }} />
                <button type="button" className="custom-tag-add" aria-label="Agregar" onClick={() => addCustomTag(key)}>+</button>
              </div>
              {key === "music" && (
                <div className="sidebar-field" style={{ marginTop: 8 }}><label>Artista o canción favorita</label><input value={draft.musicExtra || ""} onChange={(e) => set("musicExtra", e.target.value)} placeholder="Ej: Los Jaivas, La Joya del Pacífico..." /></div>
              )}
              {key === "social" && (
                <div className="sidebar-field" style={{ marginTop: 10 }}><label>Comentario adicional</label><input value={draft.extra || ""} onChange={(e) => set("extra", e.target.value)} placeholder="Algo más que quieras contarnos..." /></div>
              )}
            </div>
          ))}

          <div className="sidebar-section">
            <div className="sidebar-section-title">🦾 Ayudas técnicas</div>
            <div className="sidebar-chip-grid">
              {CATALOG.devices.map((h) => (
                <button type="button" key={h} className={`sidebar-chip${draft.helpDevices.includes(h) ? " sel" : ""}`} aria-pressed={draft.helpDevices.includes(h)} onClick={() => toggleIn("helpDevices", h)}>{h}</button>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">🏠 Vivienda del paciente</div>
            <div className="sidebar-field">
              <label>Con quién vive</label>
              <div className="sidebar-chip-grid" style={{ marginBottom: 0 }}>
                {CATALOG.livesWith.map((h) => (
                  <button type="button" key={h} className={`sidebar-chip${(draft.livesWith || []).includes(h) ? " sel" : ""}`} aria-pressed={(draft.livesWith || []).includes(h)} onClick={() => toggleIn("livesWith", h)}>{h}</button>
                ))}
              </div>
            </div>
            <div className="sidebar-field" style={{ marginTop: 10 }}>
              <label>Dónde vive (ciudad, comuna, sector)</label>
              <input value={draft.livesWhere || ""} onChange={(e) => set("livesWhere", e.target.value)} placeholder="Ej: Pudahuel, Santiago / Sector rural Los Maitenes..." />
            </div>
            <div className="sidebar-field" style={{ marginTop: 10 }}>
              <label>Tipo de zona</label>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                {CATALOG.zonas.map((z) => (
                  <button type="button" key={z} aria-pressed={draft.zonaType === z} onClick={() => set("zonaType", draft.zonaType === z ? "" : z)}
                    style={{ flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: "0.85rem", fontWeight: 600,
                      border: draft.zonaType === z ? "2px solid var(--teal)" : "1.5px solid #E2E8F0",
                      background: draft.zonaType === z ? "var(--teal)" : "#F8FAFC", color: draft.zonaType === z ? "white" : "var(--slate)", transition: "all 0.18s" }}>
                    {z === "Urbana" ? "🏙️ Urbana" : "🌄 Rural"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">💬 Mensaje de la familia</div>
            <div className="sidebar-field">
              <label>¿Hay algo más que quieran contarnos sobre {draft.patNick || draft.patName || "el paciente"}?</label>
              <textarea value={draft.familyMessage || ""} onChange={(e) => set("familyMessage", e.target.value)}
                placeholder="Escribe aquí cualquier cosa que consideres importante que el equipo de salud sepa: rasgos de personalidad, miedos, esperanzas, anécdotas, creencias, cosas que le dan ánimo..."
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontFamily: "'DM Sans',sans-serif", fontSize: "0.875rem", color: "var(--text)", background: "#F8FAFC", outline: "none", resize: "vertical", minHeight: 110, lineHeight: 1.6 }} />
              <div style={{ fontSize: "0.7rem", color: "var(--slate)", marginTop: 5, textAlign: "right" }}>{(draft.familyMessage || "").length} caracteres</div>
            </div>
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "10px 12px", fontSize: "0.75rem", color: "#1E40AF", lineHeight: 1.6 }}>
              💙 Este mensaje aparecerá en la ficha imprimible para que todo el equipo pueda leerlo.
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">⚙️ Preferencias</div>
            <div className="toggle-row">
              <div className="toggle-row-left"><span>{draftPrefs.darkMode ? "🌙 Modo noche" : "☀️ Modo día"}</span><small>{draftPrefs.darkMode ? "Pantalla oscura, ideal de noche" : "Pantalla clara, ideal de día"}</small></div>
              <button type="button" role="switch" aria-checked={!!draftPrefs.darkMode} aria-label="Modo noche" className={`toggle-sw ${draftPrefs.darkMode ? "on" : "off"}`} onClick={() => setDraftPrefs((p) => ({ ...p, darkMode: !p.darkMode }))} />
            </div>
            <div className="toggle-row">
              <div className="toggle-row-left"><span>🔔 Notificaciones</span><small>{draftPrefs.notifs ? "Recibirás avisos del equipo (próximamente)" : "Notificaciones desactivadas"}</small></div>
              <button type="button" role="switch" aria-checked={!!draftPrefs.notifs} aria-label="Notificaciones" className={`toggle-sw ${draftPrefs.notifs ? "on" : "off"}`} onClick={() => setDraftPrefs((p) => ({ ...p, notifs: !p.notifs }))} />
            </div>
          </div>

          <button className="sidebar-save-btn" disabled={saving} onClick={() => onSave(draft, draftPrefs)}>{saving ? "Guardando…" : "Guardar cambios ✓"}</button>
        </div>
      </aside>
    </>
  );
}
