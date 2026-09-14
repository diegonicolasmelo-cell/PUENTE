/**
 * Ejemplo del árbol familiar, mostrado como hoja sobre la pantalla desde la franja
 * "¿Necesitas un ejemplo?" del árbol. No toca el árbol de la familia: solo se mira y se cierra.
 *
 * Se dibuja con un portal sobre <body>: la tarjeta del onboarding usa backdrop-filter, que
 * convierte a cualquier ancestro en bloque contenedor de los elementos position:fixed y dejaría
 * la hoja encerrada dentro de la tarjeta.
 *
 * Los retratos son ilustraciones dibujadas aquí mismo (SVG), no fotografías: una foto de una
 * persona real dentro de la app exigiría su consentimiento, y las de banco de imágenes se ven
 * impersonales. Cada una tiene color de fondo, ropa, piel y pelo distintos para que se
 * distingan de un vistazo, como se distinguirían fotos reales.
 */
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const PORTRAITS = {
  pedro:   { bg: "#E8EDF2", clothes: "#5A6A7A", skin: "#E8B894", hair: "#C9CDD3" },
  javiera: { bg: "#F3E8F0", clothes: "#7A6A8D", skin: "#E8B894", hair: "#C9CDD3", long: true },
  juan:    { bg: "#CAF0F8", clothes: "#0077B6", skin: "#D9A074", hair: "#3A2C23" },
  maria:   { bg: "#FFF3E0", clothes: "#E9724C", skin: "#E8B894", hair: "#4A342A", long: true },
  javier:  { bg: "#ECFDF5", clothes: "#5A6E4A", skin: "#C98A5E", hair: "#2E2118" },
  luis:    { bg: "#EFF6FF", clothes: "#1E40AF", skin: "#E8B894", hair: "#3A2C23" },
  jose:    { bg: "#F5F3FF", clothes: "#5B21B6", skin: "#D9A074", hair: "#241A12" },
  raul:    { bg: "#FEF3C7", clothes: "#B45309", skin: "#E8B894", hair: "#4A342A" },
};

function Portrait({ id, size }) {
  const p = PORTRAITS[id];
  if (!p) return null;
  const clip = `fx-clip-${id}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <defs><clipPath id={clip}><circle cx="32" cy="32" r="32" /></clipPath></defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="64" height="64" fill={p.bg} />
        {p.long && <path d="M18 22c0-9 6-14 14-14s14 5 14 14v22c0 3-3 4-4 1l-3-12c-2 2-4 3-7 3s-5-1-7-3l-3 12c-1 3-4 2-4-1z" fill={p.hair} />}
        <path d="M32 39c-11 0-19 7-19 17v9h38v-9c0-10-8-17-19-17z" fill={p.clothes} />
        <circle cx="32" cy="25" r="13" fill={p.skin} />
        <path d="M19 25a13 13 0 0 1 26 0c0-9-5-13-13-13s-13 4-13 13z" fill={p.hair} />
      </g>
    </svg>
  );
}

const GENS = [
  { title: "Generación anterior", people: [["pedro", "Pedro", "Papá"], ["javiera", "Javiera", "Mamá"]] },
  { title: "Juan y su generación", people: [["maria", "María", "Hermano/a"], ["juan", "Juan", null], ["javier", "Javier", "Hermano/a"]] },
  { title: "Hijos / generación siguiente", people: [["luis", "Luis", "Hijo/a"], ["jose", "José", "Hijo/a"], ["raul", "Raúl", "Hijo/a"]] },
];

const LineV = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
    <div style={{ width: 2, height: 24, background: "rgba(255,255,255,0.2)", borderRadius: 1 }} />
  </div>
);

export default function FamilyExample({ onClose }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    if (closeRef.current) closeRef.current.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="example-overlay" onClick={onClose}>
      <div className="example-sheet" role="dialog" aria-modal="true" aria-label="Ejemplo de árbol familiar" ref={sheetRef} onClick={(e) => e.stopPropagation()}>
        <div className="example-handle" />
        <h2 className="example-title">Ejemplo: la familia de Juan</h2>
        <p className="example-lead">Así quedó el árbol de otra familia. El tuyo lo completas tú; este ejemplo no cambia nada de lo que ya escribiste.</p>

        {GENS.map((gen, gi) => (
          <div key={gen.title}>
            {gi > 0 && <LineV />}
            <div className="example-genlbl">{gen.title}</div>
            <div className="example-row">
              {gen.people.map(([id, name, role]) => {
                const patient = role === null;
                return (
                  <div className="example-node" key={id}>
                    <div className={`example-bub${patient ? " patient" : ""}`}>
                      <Portrait id={id} size={patient ? 76 : 64} />
                    </div>
                    <div className="example-name">{name}</div>
                    <div className={`example-role${patient ? " patient" : ""}`}>{patient ? "⭐ Paciente" : role}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="example-note">
          <span aria-hidden="true">💙</span>
          <p>No necesitas incluir a todos. Con las personas más cercanas basta: son las que el equipo nombrará al hablarle.</p>
        </div>
        <button className="ob-btn" ref={closeRef} onClick={onClose}>Entendido, volver a mi árbol</button>
      </div>
    </div>,
    document.body
  );
}
