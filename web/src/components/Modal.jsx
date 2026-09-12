/** Hoja modal inferior. Cierra al tocar el fondo o con Escape. */
import { useEffect } from "react";

export default function Modal({ onClose, children, closeLabel = "Cerrar" }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        {children}
        <button className="ob-btn" style={{ marginTop: 20 }} onClick={onClose}>{closeLabel}</button>
      </div>
    </div>
  );
}
