import { useState } from "react";
import { staffCall } from "../api.js";

/** Registro de un paciente por el equipo: genera el código para entregarlo a la familia. */
export function useRegisterModal({ showToast, onDone }) {
  const [open, setOpen] = useState(false);
  const [patName, setPatName] = useState("");
  const [patNick, setPatNick] = useState("");
  const [cama, setCama] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const reset = () => { setOpen(false); setPatName(""); setPatNick(""); setCama(""); setResult(null); };
  const submit = async () => {
    if (!patName.trim()) { showToast("⚠️ Escribe el nombre del paciente"); return; }
    setBusy(true);
    try { const r = await staffCall("staffRegisterPatient", { patName: patName.trim(), patNick: patNick.trim(), cama: cama.trim() }); setResult(r); onDone && onDone(); }
    catch (e) { showToast(`⚠️ ${e.message}`); }
    finally { setBusy(false); }
  };

  const modal = open ? (
    <div className="eq-modal-bg" onClick={reset}>
      <div className="eq-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {!result ? (
          <>
            <h2>Registrar paciente</h2>
            <p className="eq-muted" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>Se crea el paciente en tu servicio y se genera un código para que la familia complete el perfil desde su teléfono.</p>
            <div className="eq-field"><label className="eq-label">Nombre completo</label><input className="eq-input" value={patName} onChange={(e) => setPatName(e.target.value)} placeholder="Ej: Carlos Pérez Soto" autoFocus /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: 10 }}>
              <div className="eq-field"><label className="eq-label">Apodo (opcional)</label><input className="eq-input" value={patNick} onChange={(e) => setPatNick(e.target.value)} placeholder="Don Carlos" /></div>
              <div className="eq-field"><label className="eq-label">Cama</label><input className="eq-input" value={cama} onChange={(e) => setCama(e.target.value)} placeholder="4" /></div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="eq-btn ghost" onClick={reset}>Cancelar</button>
              <button className="eq-btn primary" disabled={busy} onClick={submit}>{busy ? "Creando…" : "Crear y generar código"}</button>
            </div>
          </>
        ) : (
          <>
            <h2>Código de acceso</h2>
            <p className="eq-muted" style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>Entrégalo a la familia. En la app eligen "Ya tengo un código de acceso" y completan el perfil.</p>
            <div style={{ textAlign: "center", background: "#F8FAFC", border: "1.5px dashed #CBD5E1", borderRadius: 14, padding: 18 }}>
              <div className="eq-serif" style={{ fontSize: "2rem", letterSpacing: "0.14em", color: "var(--deep)", userSelect: "all" }}>{result.code}</div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="eq-btn outline" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(result.code).then(() => showToast("📋 Código copiado")); }}>Copiar</button>
              <button className="eq-btn primary" onClick={reset}>Listo</button>
            </div>
          </>
        )}
      </div>
    </div>
  ) : null;

  return { modal, open: () => setOpen(true) };
}
