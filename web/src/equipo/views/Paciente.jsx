import { useEffect, useState, useCallback } from "react";
import { staffCall, INSUMOS, ETAPAS, ESTADOS, REQ_STATE, when, ago, initials } from "../api.js";
import { normalizeForm, normalizeTree, splitHobbies, displayRole } from "../../lib/profile.js";
import { CHECKLIST_ITEMS, CONFIG_DEFAULTS } from "../../data/defaults.js";
import Ficha from "../../screens/Ficha.jsx";

const norm = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export default function Paciente({ patientId, session, showToast, onChanged, onBack }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [etapa, setEtapa] = useState(1);
  const [estado, setEstado] = useState("activo");
  const [cama, setCama] = useState("");
  const [saving, setSaving] = useState(false);
  const [tipo, setTipo] = useState(INSUMOS[0]);
  const [texto, setTexto] = useState("");
  const [nota, setNota] = useState("");
  const [prioridad, setPrioridad] = useState("normal");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [showFicha, setShowFicha] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await staffCall("staffPatient", { patientId });
      setData(d); setError(null);
      setEtapa(d.paciente.etapa); setEstado(d.paciente.estado); setCama(d.paciente.cama || "");
    } catch (e) { setError(e.message); }
  }, [patientId]);
  useEffect(() => { load(); }, [load]);

  if (error) return <div className="eq-empty">No se pudo abrir el paciente: {error}<div style={{ marginTop: 12 }}><button className="eq-btn outline sm" onClick={onBack}>Volver</button></div></div>;
  if (!data) return <div className="eq-empty">Cargando…</div>;

  const p = data.paciente;
  const form = normalizeForm(data.profile);
  const tree = normalizeTree(data.family);
  const pat = tree.find((n) => n.id === "pat");
  const groups = splitHobbies(form);
  const familyList = tree.filter((n) => n.id !== "pat" && n.label);
  const dirty = etapa !== p.etapa || estado !== p.estado || (cama || "") !== (p.cama || "");
  const foreign = p.servicioId && p.servicioId !== session.servicio.id;
  const unassigned = !p.servicioId;
  const requestFor = (item) => data.solicitudes.find((r) => r.estado !== "cancelada" && (norm(r.texto) === norm(item) || norm(r.tipo) === norm(item)));
  const config = { ...CONFIG_DEFAULTS, nombre_unidad: session.servicio.nombre };

  const savePatient = async (extra = {}) => {
    setSaving(true);
    try {
      const r = await staffCall("staffUpdatePatient", { patientId, etapa, estado, cama, ...extra });
      setData((d) => ({ ...d, paciente: r.paciente })); showToast("✅ Cambios guardados"); onChanged && onChanged();
    } catch (e) { showToast(`⚠️ ${e.message}`); }
    finally { setSaving(false); }
  };

  const createRequest = async (viaWhatsapp) => {
    const t = tipo === "Otro" ? texto.trim() : tipo;
    if (!t) { showToast("⚠️ Escribe qué necesitas pedir"); return; }
    setSending(true);
    try {
      const r = await staffCall("staffCreateRequest", { patientId, tipo, texto: t, nota: nota.trim(), prioridad });
      setData((d) => ({ ...d, solicitudes: r.solicitudes }));
      setTexto(""); setNota(""); setPrioridad("normal");
      onChanged && onChanged();
      if (viaWhatsapp) {
        if (r.whatsapp) { window.open(r.whatsapp, "_blank", "noopener"); showToast("✅ Solicitud enviada; se abre WhatsApp con el texto listo"); }
        else showToast("✅ Solicitud enviada. La familia no registró WhatsApp");
      } else showToast("✅ Solicitud enviada; la familia la verá al abrir la app");
    } catch (e) { showToast(`⚠️ ${e.message}`); }
    finally { setSending(false); }
  };

  const updateRequest = async (id, estado) => {
    try { const r = await staffCall("staffUpdateRequest", { requestId: id, estado }); setData((d) => ({ ...d, solicitudes: r.solicitudes })); onChanged && onChanged(); }
    catch (e) { showToast(`⚠️ ${e.message}`); }
  };

  const sendMsg = async () => {
    const t = msg.trim(); if (!t) return;
    try { const r = await staffCall("staffSendMessage", { patientId, texto: t }); setData((d) => ({ ...d, mensajes: r.mensajes })); setMsg(""); }
    catch (e) { showToast(`⚠️ ${e.message}`); }
  };

  return (
    <>
      {foreign && <div className="app-banner">Este paciente pertenece a otro servicio; solo puedes verlo.</div>}
      {unassigned && <div className="app-banner info">Este perfil se creó sin QR de servicio. <button onClick={() => savePatient({ asignar: true })}>Asignar a {session.servicio.nombre}</button></div>}

      {/* Cabecera + etapa */}
      <div className="eq-card" style={{ padding: "20px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
        <div className="eq-pavatar" style={{ width: 64, height: 64, fontSize: "1.2rem", border: "3px solid var(--mint)" }}>{pat && pat.photo ? <img src={pat.photo} alt="" /> : initials(p.patName)}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{p.patName} {p.patNick && <span className="eq-muted" style={{ fontWeight: 400, fontSize: "0.95rem" }}>"{p.patNick}"</span>}</div>
          <div className="eq-muted" style={{ fontSize: "0.82rem", marginTop: 3 }}>{p.patJob ? `${p.patJob} · ` : ""}{p.ingreso ? `ingresó el ${new Date(p.ingreso).toLocaleDateString("es-CL", { day: "numeric", month: "long" })}` : ""}</div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 8, fontSize: "0.82rem" }}>
            {p.famName ? <span><strong>{p.famName}</strong>{p.famPhone ? ` · ${p.famPhone}` : " · sin WhatsApp"}</span> : <span className="eq-muted">Sin familiar conectado todavía</span>}
            <span className="eq-tag blue eq-serif" style={{ letterSpacing: "0.1em", fontSize: "0.78rem" }}>{p.code}</span>
            <span className="eq-muted" style={{ fontSize: "0.75rem" }}>familia activa {ago(p.updatedAt)}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 280, flex: "1 1 320px" }}>
          <div className="eq-h">Etapa que ve la familia</div>
          <div className="eq-seg">{ETAPAS.map((l, i) => <button key={l} className={i + 1 < etapa ? "done" : i + 1 === etapa ? "cur" : ""} disabled={foreign} onClick={() => setEtapa(i + 1)}>{l}</button>)}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select className="eq-select" style={{ width: 150 }} value={estado} disabled={foreign} onChange={(e) => setEstado(e.target.value)}>{ESTADOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            <input className="eq-input" style={{ width: 110 }} placeholder="Cama" value={cama} disabled={foreign} onChange={(e) => setCama(e.target.value)} />
            <button className="eq-btn primary" style={{ marginLeft: "auto" }} disabled={!dirty || saving || foreign} onClick={() => savePatient()}>{saving ? "Guardando…" : "Guardar cambios"}</button>
          </div>
        </div>
      </div>

      <div className="eq-two">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pedir algo a la familia */}
          <div className="eq-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div className="eq-h">Pedir algo a la familia</div><span className="eq-muted" style={{ fontSize: "0.75rem" }}>Lo verá al abrir la app</span></div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{INSUMOS.map((i) => <button key={i} className={`eq-chip ${tipo === i ? "sel" : ""}`} onClick={() => setTipo(i)}>{i}</button>)}</div>
            {tipo === "Otro" && <input className="eq-input" placeholder="¿Qué necesitas pedir?" value={texto} onChange={(e) => setTexto(e.target.value)} />}
            <input className="eq-input" placeholder="Detalle (talla, cantidad, para cuándo…)" value={nota} onChange={(e) => setNota(e.target.value)} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <div className="eq-seg" style={{ width: 170 }}><button className={prioridad === "normal" ? "cur" : ""} onClick={() => setPrioridad("normal")}>Normal</button><button className={prioridad === "urgente" ? "cur" : ""} onClick={() => setPrioridad("urgente")}>Urgente</button></div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="eq-btn outline" disabled={sending || foreign || !p.famPhone} title={!p.famPhone ? "La familia no registró WhatsApp" : ""} onClick={() => createRequest(true)}>Avisar por WhatsApp</button>
                <button className="eq-btn primary" disabled={sending || foreign} onClick={() => createRequest(false)}>{sending ? "Enviando…" : "Enviar a la app"}</button>
              </div>
            </div>
          </div>
          {/* Solicitudes */}
          <div className="eq-card" style={{ padding: "18px 20px 8px" }}>
            <div className="eq-h" style={{ marginBottom: 4 }}>Solicitudes de {p.patNick || p.patName.split(" ")[0]}</div>
            {data.solicitudes.length === 0 && <div className="eq-muted" style={{ fontSize: "0.82rem", padding: "10px 0 14px" }}>Sin solicitudes todavía.</div>}
            {data.solicitudes.map((r) => {
              const [label, color] = REQ_STATE[r.estado] || REQ_STATE.pendiente;
              return (
                <div key={r.id} className="eq-row">
                  <div className="eq-icon-box" style={{ background: color === "green" ? "#ECFDF5" : color === "blue" ? "#EFF6FF" : "#FFF7ED" }}>{r.estado === "recibido" ? "✓" : r.estado === "en_camino" ? "→" : "•"}</div>
                  <div style={{ flex: 1, fontSize: "0.85rem", lineHeight: 1.45, minWidth: 0 }}>
                    <span style={{ fontWeight: 600 }}>{r.texto}</span>{r.prioridad === "urgente" && <span className="eq-tag red" style={{ marginLeft: 8 }}>Urgente</span>}{r.nota && <span className="eq-muted"> · {r.nota}</span>}
                    <div className="eq-muted" style={{ fontSize: "0.75rem" }}>{r.estado === "recibido" ? `Recibido ${when(r.recibidoEn)} por ${r.recibidoPor}` : r.respondidoEn ? `La familia respondió "${r.respuesta}" ${when(r.respondidoEn)}` : `Enviado ${when(r.creadoEn)} por ${r.creadoPor}`}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <span className={`eq-tag ${color}`}>{label}</span>
                    {r.estado !== "recibido" && !foreign && <button className="eq-btn outline sm" onClick={() => updateRequest(r.id, "recibido")}>Recibido</button>}
                    {r.estado === "pendiente" && !foreign && <button className="eq-btn ghost sm" onClick={() => updateRequest(r.id, "cancelada")}>Cancelar</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Mensajes */}
          <div className="eq-card" id="mensajes" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div className="eq-h">Mensajes con la familia</div><span className="eq-muted" style={{ fontSize: "0.75rem" }}>No es un canal de urgencias</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {data.mensajes.length === 0 && <div className="eq-muted" style={{ fontSize: "0.82rem" }}>Sin mensajes. La familia puede escribir desde su app; tú puedes iniciar la conversación aquí.</div>}
              {data.mensajes.map((m) => <div key={m.id} className={`eq-bubble ${m.origen}`}>{m.texto}<small>{m.autor} · {when(m.creadoEn)}</small></div>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="eq-input" placeholder="Escribe una respuesta" value={msg} disabled={foreign} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMsg(); }} />
              <button className="eq-btn primary" disabled={!msg.trim() || foreign} onClick={sendMsg} aria-label="Enviar">Enviar</button>
            </div>
          </div>
          {/* Útiles */}
          <div className="eq-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div className="eq-h">Útiles que la familia marcó como traídos</div><span className="eq-tag green">{Object.values(form.checklist || {}).filter(Boolean).length} de {CHECKLIST_ITEMS.length}</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "8px 16px", fontSize: "0.85rem" }}>
              {CHECKLIST_ITEMS.map((item) => { const on = form.checklist && form.checklist[item]; const req = requestFor(item); return (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8 }}><div className={`check-box ${on ? "checked" : ""}`} style={{ width: 18, height: 18 }}>{on && <span style={{ color: "var(--ocean)", fontSize: "0.7rem", fontWeight: 700 }}>✓</span>}</div><span>{item}</span>{req && <span className={`eq-tag ${REQ_STATE[req.estado][1]}`} style={{ fontSize: "0.62rem", padding: "2px 7px" }}>{REQ_STATE[req.estado][0].toLowerCase()}</span>}</div>
              ); })}
            </div>
          </div>
          {/* Perfil humanizado */}
          <div className="eq-card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div className="eq-h">Quién es {p.patNick || p.patName.split(" ")[0]}, según su familia</div><button className="eq-btn outline sm" onClick={() => setShowFicha(true)}>Ver e imprimir ficha</button></div>
            {p.sinFamiliar ? <div className="eq-muted" style={{ fontSize: "0.82rem" }}>La familia aún no completa el perfil.</div> : (
              <>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {groups.music.map((t) => <span key={"m" + t} className="eq-tag blue">{t}</span>)}{form.musicExtra && <span className="eq-tag blue">{form.musicExtra}</span>}
                  {groups.sport.map((t) => <span key={"s" + t} className="eq-tag green">{t}</span>)}{groups.daily.map((t) => <span key={"d" + t} className="eq-tag purple">{t}</span>)}{groups.social.map((t) => <span key={"o" + t} className="eq-tag orange">{t}</span>)}
                  {(form.helpDevices || []).filter((h) => !h.includes("No utiliza")).map((h) => <span key={h} className="eq-tag grey">{h}</span>)}
                </div>
                {familyList.length > 0 && <div style={{ fontSize: "0.85rem", lineHeight: 1.55 }}><strong>Su familia:</strong> {familyList.map((n) => `${n.label} (${displayRole(n)})`).join(", ")}.{form.livesWith.length ? ` Vive ${form.livesWith.join(", ").toLowerCase()}${form.livesWhere ? ` en ${form.livesWhere}` : ""}.` : ""}</div>}
                {form.familyMessage && <div style={{ fontSize: "0.85rem", lineHeight: 1.55, fontStyle: "italic", borderLeft: "3px solid var(--foam)", paddingLeft: 12 }}>"{form.familyMessage}"</div>}
                {p.incompleto && <div className="eq-muted" style={{ fontSize: "0.75rem" }}>Faltan datos en el perfil (educación, vivienda o mensaje). Puedes recordárselo a la familia por mensaje.</div>}
              </>
            )}
          </div>
        </div>
      </div>

      {showFicha && (
        <div className="eq-ficha-overlay">
          <div className="eq-no-print" style={{ position: "sticky", top: 0, zIndex: 5, display: "flex", justifyContent: "flex-end", padding: "10px 16px", background: "white", borderBottom: "1px solid #E2E8F0" }}>
            <button className="eq-btn ghost sm" onClick={() => setShowFicha(false)}>✕ Cerrar</button>
          </div>
          <div className="app-shell" style={{ maxWidth: "100%", height: "auto", minHeight: 0, background: "var(--light)" }}>
            <Ficha form={form} treeNodes={tree} patFirst={(p.patName || "").split(" ")[0] || "Paciente"} config={config} onBack={() => setShowFicha(false)} />
          </div>
        </div>
      )}
    </>
  );
}
