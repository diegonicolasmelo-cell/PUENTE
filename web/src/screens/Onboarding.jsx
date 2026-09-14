/**
 * Onboarding en 6 pasos (igual al prototipo) + recuperación por código de acceso + creación del
 * perfil en el backend al confirmar la tarjeta. El paso final muestra el código para volver a entrar.
 */
import { useState } from "react";
import PuenteLogo from "../components/Logo.jsx";
import FamilyTree from "../components/FamilyTree.jsx";
import Toast from "../components/Toast.jsx";
import { CATALOG } from "../data/defaults.js";
import { patientNick, readableHobbies, displayRole } from "../lib/profile.js";

const CHIP_GROUPS = [
  { key: "music",  label: "🎵 Música que escucha",      custom: "musicCustom", placeholder: "Otro género musical (ej: Jazz, Cueca, Tropical...)" },
  { key: "sport",  label: "🏃 Actividad física o deporte", custom: "sportCustom", placeholder: "Otro deporte (ej: Tenis, Golf, Boxeo...)" },
  { key: "daily",  label: "🌿 Actividades cotidianas",  custom: "dailyCustom", placeholder: "Otras actividades cotidianas (ej: Pintura, Ajedrez, Fotografía...)" },
  { key: "social", label: "👥 Vida social y espiritual", custom: "extra",       placeholder: "¿Algo más que quieras contarnos?" },
];

function formatCodeInput(v) {
  const clean = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return clean.length > 4 ? clean.slice(0, 4) + "-" + clean.slice(4) : clean;
}

export default function Onboarding({ form, setForm, treeNodes, setTreeNodes, toast, showToast, mode, busy, session, onCreate, onRestore, onEnter }) {
  const [obStep, setObStep] = useState(0);
  const [restoring, setRestoring] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const nick = patientNick(form);

  const toggleChip = (key, val) => setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));

  const restore = async () => {
    const code = codeInput.replace(/[^A-Z0-9]/g, "");
    if (code.length < 8) { showToast("⚠️ El código tiene 8 caracteres"); return; }
    await onRestore(code);
  };

  const Header = ({ size = 28, tagline, style }) => (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><PuenteLogo size={size} showText={true} /></div>
      {tagline && <p className="ob-tagline" style={style}>{tagline}</p>}
    </>
  );

  return (
    <div className="onboarding">
      <div className="onboarding-bg">
        <div className="onboarding-blob" style={{ width: 300, height: 300, background: "#0077B6", top: -80, right: -80 }} />
        <div className="onboarding-blob" style={{ width: 200, height: 200, background: "#02C39A", bottom: 60, left: -60 }} />
        <div className="onboarding-blob" style={{ width: 150, height: 150, background: "#6D28D9", bottom: 180, right: 20 }} />
      </div>

      <div className="ob-progress" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className={`ob-dot ${obStep === i ? "active" : ""}`} />)}
      </div>

      {obStep === 0 && !restoring && (
        <div className="ob-step active">
          <div className="float" style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><PuenteLogo size={56} showText={true} /></div>
          <p className="ob-tagline">Conectando familias con el cuidado humanizado.<br />No estás solo/a en este camino.</p>
          <div className="ob-card">
            <h2>¿Quién eres?</h2>
            <p>Cuéntanos cómo te llamas y cómo contactarte. Esta información es solo para el equipo de salud.</p>
            <div className="field-group">
              <label className="field-label" htmlFor="ob-fam-name">Tu nombre</label>
              <input id="ob-fam-name" className="field-input" placeholder="Ej: María González" value={form.famName} onChange={(e) => setForm((f) => ({ ...f, famName: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="ob-fam-phone">WhatsApp (opcional)</label>
              <input id="ob-fam-phone" className="field-input" inputMode="tel" placeholder="+56 9 1234 5678" value={form.famPhone} onChange={(e) => setForm((f) => ({ ...f, famPhone: e.target.value }))} />
            </div>
          </div>
          <button className="ob-btn" onClick={() => { if (!form.famName.trim()) { showToast("⚠️ Ingresa tu nombre para continuar"); return; } setObStep(1); }}>Continuar →</button>
          {mode !== "local" && <button className="code-entry-link" onClick={() => setRestoring(true)}>Ya tengo un código de acceso</button>}
          {mode !== "gas" && <a className="staff-link" href={import.meta.env.BASE_URL + "equipo.html"}>¿Eres del equipo de salud? Entrar al panel</a>}
        </div>
      )}

      {obStep === 0 && restoring && (
        <div className="ob-step active">
          <Header size={40} tagline="Recupera el perfil que ya creaste" />
          <div className="ob-card">
            <h2>Código de acceso</h2>
            <p>Lo recibiste al terminar el registro. También puede dártelo el equipo de la UCI.</p>
            <div className="field-group" style={{ marginTop: 16 }}>
              <input className="code-input" aria-label="Código de acceso" placeholder="XXXX-XXXX" autoCapitalize="characters" autoComplete="off" value={codeInput}
                onChange={(e) => setCodeInput(formatCodeInput(e.target.value))}
                onKeyDown={(e) => { if (e.key === "Enter") restore(); }} />
            </div>
          </div>
          <button className="ob-btn" disabled={busy} onClick={restore}>{busy ? "Buscando…" : "Recuperar perfil →"}</button>
          <button className="ob-btn-ghost" onClick={() => setRestoring(false)}>← Volver</button>
        </div>
      )}

      {obStep === 1 && (
        <div className="ob-step active">
          <Header tagline="Queremos conocer a tu familiar más allá de su diagnóstico" style={{ marginBottom: 24 }} />
          <div className="ob-card">
            <h2>¿Cómo se llama?</h2>
            <p>Saber quién es como persona nos permite brindarle un cuidado más humano y personalizado.</p>
            <div className="field-group">
              <label className="field-label" htmlFor="ob-pat-name">Nombre completo</label>
              <input id="ob-pat-name" className="field-input" placeholder="Ej: Carlos Pérez Soto" value={form.patName} onChange={(e) => setForm((f) => ({ ...f, patName: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="ob-pat-nick">¿Cómo le gusta que le llamen?</label>
              <input id="ob-pat-nick" className="field-input" placeholder="Apodo o nombre preferido" value={form.patNick} onChange={(e) => setForm((f) => ({ ...f, patNick: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label" htmlFor="ob-pat-job">¿A qué se dedica?</label>
              <input id="ob-pat-job" className="field-input" placeholder="Profesión u ocupación" value={form.patJob} onChange={(e) => setForm((f) => ({ ...f, patJob: e.target.value }))} />
            </div>
          </div>
          <button className="ob-btn" onClick={() => { if (!form.patName.trim()) { showToast("⚠️ Ingresa el nombre del paciente"); return; } setObStep(2); }}>Continuar →</button>
          <button className="ob-btn-ghost" onClick={() => setObStep(0)}>← Volver</button>
        </div>
      )}

      {obStep === 2 && (
        <div className="ob-step active">
          <Header tagline="Su vida más allá de la UCI" style={{ marginBottom: 16 }} />
          <div className="ob-card">
            <h2>Queremos conocer cuáles son sus gustos</h2>
            <p>Cuéntanos sobre su vida cotidiana. Esto permite al equipo personalizar su cuidado y estimulación sensorial.</p>
            {CHIP_GROUPS.map(({ key, label, custom, placeholder }) => (
              <div className="field-group" key={key} style={key === "music" ? { marginTop: 16 } : undefined}>
                <label className="field-label">{label}</label>
                <div className="chip-grid" role="group" aria-label={label}>
                  {CATALOG[key].map((h) => (
                    <button type="button" key={h} className={`chip ${form.hobbies.includes(h) ? "selected" : ""}`} aria-pressed={form.hobbies.includes(h)} onClick={() => toggleChip("hobbies", h)}>{h}</button>
                  ))}
                </div>
                <input className="field-input" style={{ marginTop: 8 }} placeholder={placeholder} value={form[custom] || ""} onChange={(e) => setForm((f) => ({ ...f, [custom]: e.target.value }))} />
                {key === "music" && (
                  <input className="field-input" style={{ marginTop: 8 }} placeholder="¿Artista o canción favorita?" value={form.musicExtra || ""} onChange={(e) => setForm((f) => ({ ...f, musicExtra: e.target.value }))} />
                )}
              </div>
            ))}
            <div className="field-group">
              <label className="field-label">🦾 Ayudas técnicas (seleccione las que utilice)</label>
              <div className="chip-grid" role="group" aria-label="Ayudas técnicas">
                {CATALOG.devices.map((h) => (
                  <button type="button" key={h} className={`chip ${form.helpDevices.includes(h) ? "selected" : ""}`} aria-pressed={form.helpDevices.includes(h)} onClick={() => toggleChip("helpDevices", h)}>{h}</button>
                ))}
              </div>
            </div>
          </div>
          <button className="ob-btn" onClick={() => setObStep(3)}>Continuar →</button>
          <button className="ob-btn-ghost" onClick={() => setObStep(1)}>← Volver</button>
        </div>
      )}

      {obStep === 3 && (
        <div className="ob-step active">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}><PuenteLogo size={28} showText={true} /></div>
          <p className="ob-tagline" style={{ marginBottom: 16, fontSize: "0.85rem" }}>El entorno familiar de {nick}</p>
          <FamilyTree treeNodes={treeNodes} setTreeNodes={setTreeNodes} patNick={nick} showToast={showToast} />
          <button className="ob-btn" onClick={() => setObStep(4)}>Continuar →</button>
          <button className="ob-btn-ghost" onClick={() => setObStep(2)}>← Volver</button>
        </div>
      )}

      {obStep === 4 && (() => {
        const family = treeNodes.filter((n) => n.id !== "pat" && n.label).map((n) => `${n.label} (${displayRole(n)})`);
        const hobbies = readableHobbies(form).slice(0, 5);
        const devices = (form.helpDevices || []).filter((h) => !h.includes("No utiliza"));
        const pat = treeNodes.find((n) => n.id === "pat");
        const facts = [
          form.patJob && { icon: "💼", label: "Ocupación", text: form.patJob },
          form.education && { icon: "🎓", label: "Educación", text: form.education },
          hobbies.length && { icon: "⭐", label: "Le gusta", text: hobbies.join(", ") },
          form.hobbies.includes("Tiene mascotas") && { icon: "🐾", label: "Mascotas", text: "Tiene mascotas" },
          family.length && { icon: "👨‍👩‍👧", label: "Su familia", text: family.slice(0, 4).join(" · ") },
          devices.length && { icon: "🦾", label: "Usa", text: devices.join(", ") },
          form.extra && { icon: "💬", label: "Nos contó", text: form.extra },
        ].filter(Boolean);
        return (
          <div className="ob-step active">
            <Header tagline={`Así nos presentamos a ${nick} ante el equipo de salud`} style={{ marginBottom: 16 }} />
            <div className="id-card">
              <div className="id-card-badge"><span>💙</span> Perfil Humanizado · Puente UCI</div>
              <div className="id-card-avatar">
                {pat && pat.photo ? <img src={pat.photo} alt={nick} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} /> : (pat && pat.emoji) || "🙂"}
              </div>
              <div className="id-card-name">{form.patName || "Paciente"}</div>
              {form.patNick && <div className="id-card-nickname">"{form.patNick}"</div>}
              <div className="id-card-facts">
                {facts.length === 0 && (
                  <div className="id-card-fact">
                    <span className="id-card-fact-icon">💙</span>
                    <div><div className="id-card-fact-label">Presentación</div><div className="id-card-fact-text">Hola, soy {nick}. El equipo UCI se preocupa por conocerme como persona.</div></div>
                  </div>
                )}
                {facts.map((f) => (
                  <div key={f.label} className="id-card-fact">
                    <span className="id-card-fact-icon">{f.icon}</span>
                    <div><div className="id-card-fact-label">{f.label}</div><div className="id-card-fact-text">{f.text}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="id-approve-row">
              <div role="checkbox" aria-checked={form.idCardApproved} tabIndex={0} className={`id-approve-check ${form.idCardApproved ? "checked" : ""}`}
                onClick={() => setForm((f) => ({ ...f, idCardApproved: !f.idCardApproved }))}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setForm((f) => ({ ...f, idCardApproved: !f.idCardApproved })); } }}>
                {form.idCardApproved && "✓"}
              </div>
              <div className="id-approve-text">
                Confirmo que esta tarjeta representa bien a <strong>{nick}</strong>. Entiendo que el equipo UCI la usará para brindarle un cuidado más humano y personalizado, y que los datos se guardan para ese fin.
              </div>
            </div>
            <button className="ob-btn" disabled={busy} style={{ opacity: form.idCardApproved ? 1 : 0.55 }}
              onClick={async () => {
                if (!form.idCardApproved) { showToast("⚠️ Confirma la tarjeta para continuar"); return; }
                await onCreate();
                setObStep(5);
              }}>
              {busy ? "Guardando…" : "Confirmar y continuar →"}
            </button>
            <button className="ob-btn-ghost" onClick={() => setObStep(3)}>← Volver</button>
          </div>
        );
      })()}

      {obStep === 5 && (
        <div className="ob-step active">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: "4rem", marginBottom: 12 }} className="float">💙</div>
            <div className="ob-logo" style={{ marginBottom: 8 }}>¡Listo, {form.famName.split(" ")[0]}!</div>
            <p className="ob-tagline">El perfil de <strong style={{ color: "#00B4D8" }}>{form.patName || "tu familiar"}</strong> fue creado. Estamos aquí para acompañarte.</p>
          </div>

          {session && session.code ? (
            <div className="access-code-box">
              <div className="access-code-label">Tu código de acceso</div>
              <div className="access-code-value">{session.code}</div>
              <div className="access-code-hint">Guárdalo: con él puedes volver a entrar desde cualquier teléfono y compartirlo con otro familiar directo.</div>
              <div className="access-code-actions">
                <button type="button" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(session.code).then(() => showToast("📋 Código copiado")).catch(() => showToast("Copia el código manualmente")); }}>📋 Copiar</button>
                {navigator.share && <button type="button" onClick={() => navigator.share({ title: "Puente UCI", text: `Código de acceso Puente UCI de ${form.patName}: ${session.code}` }).catch(() => {})}>📤 Compartir</button>}
              </div>
            </div>
          ) : (
            <div className="ob-card" style={{ background: "rgba(233,114,76,0.12)", border: "1px solid rgba(233,114,76,0.35)" }}>
              <p style={{ color: "#FFD9C7", fontSize: "0.85rem", lineHeight: 1.7 }}>
                {mode === "local"
                  ? "📱 Esta versión guarda la información solo en este dispositivo. Cuando el equipo active el servidor, tus datos se subirán automáticamente."
                  : "📶 No pudimos conectar con el servidor. Tus datos quedaron guardados en este dispositivo y se subirán cuando haya conexión."}
              </p>
            </div>
          )}

          <div className="ob-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>🤝</div>
            <h2 style={{ marginBottom: 12 }}>Tu espacio seguro</h2>
            <p>Desde aquí podrás acceder a información sobre la UCI, entender el proceso de tu familiar y resolver tus dudas en cualquier momento.</p>
          </div>
          <div className="ob-card" style={{ background: "rgba(0,180,216,0.1)", border: "1px solid rgba(0,180,216,0.3)" }}>
            <p style={{ color: "#CAF0F8", fontSize: "0.85rem", lineHeight: 1.7 }}>❤️ <em>"Cuidar a quien cuida es también cuidar al paciente. No estás solo/a en este proceso."</em></p>
          </div>
          <button className="ob-btn" onClick={onEnter}>Entrar a Puente UCI →</button>
        </div>
      )}

      <Toast message={toast} />
    </div>
  );
}
