import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { familyAppUrl } from "../api.js";

/** QR del servicio: abre la app de la familia con ?s=<servicio>, y el perfil nace ya asignado. */
export default function Qr({ session, showToast }) {
  const canvasRef = useRef(null);
  const printRef = useRef(null);
  const servicio = session.servicio || {};
  const url = `${familyAppUrl()}?s=${encodeURIComponent(servicio.id || "")}`;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      QRCode.toCanvas(canvasRef.current, url, { width: 260, margin: 1, color: { dark: "#03045E", light: "#FFFFFF" } }),
      QRCode.toCanvas(printRef.current, url, { width: 420, margin: 1, color: { dark: "#03045E", light: "#FFFFFF" } }),
    ]).then(() => { if (!cancelled) setReady(true); }).catch(() => showToast("⚠️ No se pudo generar el QR"));
    return () => { cancelled = true; };
  }, [url, showToast]);

  const copy = () => { navigator.clipboard && navigator.clipboard.writeText(url).then(() => showToast("📋 Enlace copiado")); };

  return (
    <>
      <div className="eq-two">
        <div className="eq-card eq-qr eq-no-print" style={{ padding: 24 }}>
          <div className="eq-h">QR de {servicio.nombre}</div>
          <canvas ref={canvasRef} width="260" height="260" aria-label="Código QR del servicio" />
          <div className="eq-qr-url">{url}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="eq-btn outline" onClick={copy}>Copiar enlace</button>
            <a className="eq-btn outline" href={url} target="_blank" rel="noopener noreferrer">Probar en el navegador</a>
            <button className="eq-btn primary" disabled={!ready} onClick={() => window.print()}>Imprimir cartel</button>
          </div>
        </div>
        <div className="eq-card eq-no-print" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, fontSize: "0.875rem", lineHeight: 1.6 }}>
          <div className="eq-h">Cómo se usa</div>
          <p>1. Imprime el cartel y pégalo en la sala de espera o entrégalo con la información de ingreso.</p>
          <p>2. La familia escanea el QR con la cámara del teléfono: la app se abre ya vinculada a <strong>{servicio.nombre}</strong>.</p>
          <p>3. Al terminar el registro, el paciente aparece en tu tablero. Desde ahí asignas la cama y la etapa.</p>
          <p className="eq-muted">Si una familia se registró sin el QR, su perfil aparece en "Perfiles sin servicio asignado" y lo puedes asignar con un clic.</p>
        </div>
      </div>

      {/* Cartel para imprimir (A4 vertical) */}
      <div className="eq-qr-sheet">
        <div className="eq-serif" style={{ fontSize: "34px", color: "#03045E" }}>Puente <span style={{ color: "#00B4D8" }}>UCI</span></div>
        <div style={{ fontSize: "18px", color: "#0077B6", fontWeight: 600, marginTop: 4 }}>{servicio.nombre}{servicio.piso ? ` · Piso ${servicio.piso}` : ""}</div>
        <h1 className="eq-serif" style={{ fontSize: "30px", margin: "28px 0 10px", color: "#0A1628" }}>Conozca la UCI y cuéntenos quién es su familiar</h1>
        <p style={{ fontSize: "16px", color: "#334155", maxWidth: 560, margin: "0 auto", lineHeight: 1.6 }}>Escanee este código con la cámara de su teléfono. Encontrará información sobre cada etapa, horarios y respuestas a las dudas más comunes, y podrá presentarnos a su familiar para cuidarle como persona.</p>
        <canvas ref={printRef} width="420" height="420" style={{ margin: "28px auto", display: "block" }} />
        <div style={{ fontSize: "13px", color: "#64748B", fontFamily: "ui-monospace, monospace" }}>{url}</div>
        <p style={{ fontSize: "14px", color: "#64748B", marginTop: 24 }}>Sus datos se usan solo para el cuidado en esta unidad. Al terminar recibirá un código para volver a entrar desde cualquier teléfono.</p>
      </div>
    </>
  );
}
