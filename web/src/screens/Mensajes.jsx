import { useEffect, useRef, useState } from "react";

function timeLabel(iso) {
  const d = new Date(iso); if (isNaN(d)) return "";
  const today = new Date().toDateString() === d.toDateString();
  return (today ? "hoy " : d.toLocaleDateString("es-CL", { day: "numeric", month: "short" }) + " ") + d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** Hilo de mensajes no urgentes entre la familia y el equipo del servicio. */
export default function Mensajes({ mensajes = [], famName, config, mode, onSend, onRead, onRefresh, onBack }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { onRead && onRead(); onRefresh && onRefresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ block: "end" }); }, [mensajes.length]);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true);
    const ok = await onSend(t);
    setBusy(false);
    if (ok) setText("");
  };

  return (
    <div className="screen msg-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <h1>Mensajes con el equipo</h1>
        <p>Consultas no urgentes para el equipo de {config.nombre_unidad}</p>
      </div>
      <div className="app-banner" style={{ marginTop: 16 }}>⚠️ No es un canal de urgencias. Si algo no puede esperar, llama al {config.telefono_uci || "teléfono de la unidad"}.</div>
      <div className="msg-thread">
        {mensajes.length === 0 && (
          <div className="msg-empty">Aún no hay mensajes. Puedes preguntar, por ejemplo, si puedes traer un objeto personal o cómo coordinar una visita especial.</div>
        )}
        {mensajes.map((m) => (
          <div key={m.id} className={`msg-bubble ${m.origen === "familia" ? "mine" : "theirs"}`}>
            <div className="msg-text">{m.texto}</div>
            <div className="msg-meta">{m.origen === "familia" ? (famName || "Tú") : m.autor} · {timeLabel(m.creadoEn)}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="msg-compose">
        <textarea className="msg-input" rows={2} placeholder={mode === "local" ? "Necesita conexión con el servidor" : "Escribe tu consulta al equipo"} value={text} disabled={mode === "local"}
          onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="msg-send" aria-label="Enviar" disabled={busy || !text.trim() || mode === "local"} onClick={send}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4z"></path></svg>
        </button>
      </div>
    </div>
  );
}
